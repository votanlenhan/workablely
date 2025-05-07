import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, QueryFailedError } from 'typeorm';
import {
  EquipmentAssignment,
  AssignmentStatus,
} from '../entities/equipment-assignment.entity';
import { CreateEquipmentAssignmentDto } from '../dto/create-equipment-assignment.dto';
import { UpdateEquipmentAssignmentDto } from '../dto/update-equipment-assignment.dto';
import { EquipmentService } from '@/modules/equipment/equipment.service';
import { EquipmentStatus } from '@/modules/equipment/entities/equipment.entity';
import { ShowsService } from '@/modules/shows/shows.service';
import { UsersService } from '@/modules/users/users.service';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class EquipmentAssignmentsService {
  private readonly logger = new Logger(EquipmentAssignmentsService.name);

  constructor(
    @InjectRepository(EquipmentAssignment)
    private readonly assignmentRepository: Repository<EquipmentAssignment>,
    @Inject(forwardRef(() => EquipmentService))
    private readonly equipmentService: EquipmentService,
    // Assuming ShowsService and UsersService are available and can be injected if needed
    // for validation, e.g., checking if show_id or user_id exists.
    @Inject(forwardRef(() => ShowsService))
    private readonly showsService: ShowsService, 
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async create(
    createDto: CreateEquipmentAssignmentDto,
    assignerUserId: string,
  ): Promise<EquipmentAssignment> {
    this.logger.log(
      `Creating new assignment for equipment ${createDto.equipment_id}`,
    );

    const equipment = await this.equipmentService.findOne(createDto.equipment_id);
    if (equipment.status !== EquipmentStatus.AVAILABLE) {
      // Temporarily allow assigning equipment that is not available, for more complex scenarios
      // Might need more robust logic depending on specific business rules (e.g. queuing system)
      this.logger.warn(
        `Equipment ${createDto.equipment_id} is currently ${equipment.status}, but proceeding with assignment.`,
      );
      // consider throwing BadRequestException here if strict availability is required:
      // throw new BadRequestException(`Equipment ${createDto.equipment_id} is not available for assignment.`);
    }

    // Validate show_id if provided
    if (createDto.show_id) {
        await this.showsService.findOne(createDto.show_id);
    }
    // Validate user_id (assigned_to_user) if provided
    if (createDto.user_id) {
        await this.usersService.findOneById(createDto.user_id);
    }

    const newAssignment = this.assignmentRepository.create({
      ...createDto,
      assigned_by_user_id: assignerUserId,
      assignment_date: new Date(createDto.assignment_date),
      expected_return_date: createDto.expected_return_date
        ? new Date(createDto.expected_return_date)
        : undefined,
      actual_return_date: createDto.actual_return_date
        ? new Date(createDto.actual_return_date)
        : undefined,
      status: createDto.status || AssignmentStatus.ASSIGNED, // Default to ASSIGNED if not provided
    });

    try {
      const savedAssignment = await this.assignmentRepository.save(newAssignment);
      // Update equipment status to 'In Use' after successful assignment
      await this.equipmentService.update(createDto.equipment_id, {
        status: EquipmentStatus.IN_USE,
      });
      return savedAssignment;
    } catch (error) {
      // Check for unique constraint violations or other specific DB errors if necessary
      this.logger.error(
        `Failed to create equipment assignment: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(
    options: IPaginationOptions,
  ): Promise<Pagination<EquipmentAssignment>> {
    this.logger.log('Fetching all equipment assignments with pagination');
    return paginate<EquipmentAssignment>(this.assignmentRepository, options, {
      relations: ['equipment', 'show', 'assigned_to_user', 'assigned_by_user'],
      order: { assignment_date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<EquipmentAssignment> {
    this.logger.log(`Fetching equipment assignment with id: ${id}`);
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ['equipment', 'show', 'assigned_to_user', 'assigned_by_user'],
    });
    if (!assignment) {
      this.logger.warn(`Equipment assignment with id ${id} not found`);
      throw new NotFoundException(`Equipment assignment with id ${id} not found`);
    }
    return assignment;
  }

  async update(
    id: string,
    updateDto: UpdateEquipmentAssignmentDto,
  ): Promise<EquipmentAssignment> {
    this.logger.log(`Updating equipment assignment with id: ${id}`);
    const assignment = await this.findOne(id); // Ensures assignment exists

    const previousStatus = assignment.status;
    const previousEquipmentId = assignment.equipment_id;

    // Validate show_id if provided and changed
    if (updateDto.show_id && updateDto.show_id !== assignment.show_id) {
        await this.showsService.findOne(updateDto.show_id);
    }
    // Validate user_id (assigned_to_user) if provided and changed
    if (updateDto.user_id && updateDto.user_id !== assignment.user_id) {
        await this.usersService.findOneById(updateDto.user_id);
    }
    // Validate equipment_id if provided and changed (more complex logic might be needed if equipment changes)
    if (updateDto.equipment_id && updateDto.equipment_id !== assignment.equipment_id) {
        const newEquipment = await this.equipmentService.findOne(updateDto.equipment_id);
        if (newEquipment.status !== EquipmentStatus.AVAILABLE) {
            this.logger.warn(
              `New equipment ${updateDto.equipment_id} for assignment update is ${newEquipment.status}.`
            );
            // Potentially throw error if strict availability is required for equipment change
        }
    }

    const updatePayload = {
      ...updateDto,
      ...(updateDto.assignment_date && { assignment_date: new Date(updateDto.assignment_date) }),
      ...(updateDto.expected_return_date && { expected_return_date: new Date(updateDto.expected_return_date) }),
      ...(updateDto.actual_return_date && { actual_return_date: new Date(updateDto.actual_return_date) }),
    };

    Object.assign(assignment, updatePayload);
    const updatedAssignment = await this.assignmentRepository.save(assignment);

    // Logic to update equipment status based on assignment status change
    if (updateDto.status && updateDto.status !== previousStatus) {
      if (updateDto.status === AssignmentStatus.RETURNED || updateDto.status === AssignmentStatus.LOST || updateDto.status === AssignmentStatus.DAMAGED) {
        // If assignment is marked as returned, lost, or damaged, set equipment to Available
        // More complex logic might be needed if multiple assignments exist for one piece of equipment.
        // This assumes one piece of equipment is fully tied to this assignment's active period.
        await this.equipmentService.update(assignment.equipment_id, {
          status: EquipmentStatus.AVAILABLE, // Or UNDER_MAINTENANCE if DAMAGED etc.
        });
      } else if (updateDto.status === AssignmentStatus.ASSIGNED) {
        await this.equipmentService.update(assignment.equipment_id, {
          status: EquipmentStatus.IN_USE,
        });
      }
    }

    // If equipment ID was changed in the update
    if (updateDto.equipment_id && updateDto.equipment_id !== previousEquipmentId) {
        // Set old equipment to AVAILABLE (if no other active assignments)
        // This requires checking other assignments for previousEquipmentId
        await this.equipmentService.update(previousEquipmentId, { status: EquipmentStatus.AVAILABLE });
        // Set new equipment to IN_USE
        await this.equipmentService.update(updateDto.equipment_id, { status: EquipmentStatus.IN_USE });
    }

    return updatedAssignment;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing equipment assignment with id: ${id}`);
    const assignment = await this.findOne(id); // Ensures assignment exists

    // Before removing, set associated equipment back to AVAILABLE if it was IN_USE due to this assignment.
    // This is a simplified check. A robust solution would check if there are OTHER active assignments for this equipment.
    if (assignment.equipment.status === EquipmentStatus.IN_USE) {
        const otherAssignments = await this.assignmentRepository.count({
            where: {
                equipment_id: assignment.equipment_id,
                status: AssignmentStatus.ASSIGNED,
                id: Not(assignment.id) // TypeORM `Not` operator if available and needed
            }
        });
        // The above `Not(assignment.id)` is pseudo-code for TypeORM's Not. 
        // A simpler check for now: if this one was ASSIGNED, make equipment AVAILABLE.
        if (assignment.status === AssignmentStatus.ASSIGNED) {
             await this.equipmentService.update(assignment.equipment_id, {
                status: EquipmentStatus.AVAILABLE,
            });
        }
    }
    await this.assignmentRepository.remove(assignment);
  }
} 