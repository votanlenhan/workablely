import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, QueryFailedError, Not } from 'typeorm';
import {
  EquipmentAssignment,
  AssignmentStatus,
} from '@/modules/equipment-assignments/entities/equipment-assignment.entity';
import { CreateEquipmentAssignmentDto } from '@/modules/equipment-assignments/dto/create-equipment-assignment.dto';
import { UpdateEquipmentAssignmentDto } from '@/modules/equipment-assignments/dto/update-equipment-assignment.dto';
import { Equipment, EquipmentStatus } from '@/modules/equipment/entities/equipment.entity';
import { ShowsService } from '@/modules/shows/shows.service';
import { UsersService } from '@/modules/users/users.service';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import { User } from '@/modules/users/entities/user.entity';
import { Show } from '@/modules/shows/entities/show.entity';

interface FindAllAssignmentsFilter {
  equipment_id?: string;
  show_id?: string;
  assigned_to_user_id?: string;
  status?: string;
}

@Injectable()
export class EquipmentAssignmentsService {
  private readonly logger = new Logger(EquipmentAssignmentsService.name);

  constructor(
    @InjectRepository(EquipmentAssignment)
    private readonly assignmentRepository: Repository<EquipmentAssignment>,
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
  ) {}

  async create(
    createDto: CreateEquipmentAssignmentDto,
    assignerUserId: string,
  ): Promise<EquipmentAssignment> {
    this.logger.log(
      `Creating new assignment for equipment ${createDto.equipment_id}`,
    );

    const equipment = await this.equipmentRepository.findOneBy({ id: createDto.equipment_id });
    if (!equipment) {
      throw new NotFoundException(`Equipment with ID "${createDto.equipment_id}" not found.`);
    }
    if (equipment.status === EquipmentStatus.IN_USE || equipment.status === EquipmentStatus.UNDER_MAINTENANCE) {
      throw new ConflictException(`Equipment ID "${createDto.equipment_id}" is currently ${equipment.status} and cannot be assigned.`);
    }

    if (createDto.show_id) {
      const show = await this.showRepository.findOneBy({ id: createDto.show_id });
      if (!show) {
        throw new NotFoundException(`Show with ID "${createDto.show_id}" not found.`);
      }
    }

    if (createDto.user_id) {
      const user = await this.userRepository.findOneBy({ id: createDto.user_id });
      if (!user) {
        throw new NotFoundException(`User to assign to with ID "${createDto.user_id}" not found.`);
      }
    }
    
    // Check for existing active assignment for this equipment
    const existingActiveAssignment = await this.assignmentRepository.findOne({
      where: {
        equipment_id: createDto.equipment_id,
        status: Not(AssignmentStatus.RETURNED), // Any status that is not 'Returned' is considered active/blocking
      }
    });
    if (existingActiveAssignment) {
      throw new ConflictException(`Equipment ID "${createDto.equipment_id}" is already actively assigned (Assignment ID: ${existingActiveAssignment.id}).`);
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
      equipment.status = EquipmentStatus.IN_USE;
      await this.equipmentRepository.save(equipment);
      return savedAssignment;
    } catch (error) {
      this.logger.error(
        `Failed to create equipment assignment: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Could not create equipment assignment.');
    }
  }

  async findAll(
    options: IPaginationOptions,
    filters: FindAllAssignmentsFilter,
  ): Promise<Pagination<EquipmentAssignment>> {
    this.logger.log('Fetching all equipment assignments with pagination');
    const queryBuilder = this.assignmentRepository.createQueryBuilder('assignment');
    queryBuilder
      .leftJoinAndSelect('assignment.equipment', 'equipment')
      .leftJoinAndSelect('assignment.show', 'show')
      .leftJoinAndSelect('assignment.assigned_to_user', 'assigned_to_user')
      .leftJoinAndSelect('assignment.assigned_by_user', 'assigned_by_user')
      .orderBy('assignment.assignment_date', 'DESC');

    if (filters.equipment_id) {
      queryBuilder.andWhere('assignment.equipment_id = :equipmentId', { equipmentId: filters.equipment_id });
    }
    if (filters.show_id) {
      queryBuilder.andWhere('assignment.show_id = :showId', { showId: filters.show_id });
    }
    if (filters.assigned_to_user_id) {
      queryBuilder.andWhere('assignment.assigned_to_user_id = :assignedToUserId', { assignedToUserId: filters.assigned_to_user_id });
    }
    if (filters.status) {
      queryBuilder.andWhere('assignment.status = :status', { status: filters.status });
    }

    return paginate<EquipmentAssignment>(queryBuilder, options);
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
    updated_by_user_id: string,
  ): Promise<EquipmentAssignment> {
    this.logger.log(`Updating equipment assignment with id: ${id}`);
    const assignment = await this.findOne(id); // Fetches current assignment, includes relations

    const originalStatus = assignment.status;
    const originalEquipmentId = assignment.equipment_id;
    let newEquipmentEntity: Equipment | null = null;

    // 1. Handle change of equipment_id first
    if (updateDto.equipment_id && updateDto.equipment_id !== originalEquipmentId) {
      newEquipmentEntity = await this.equipmentRepository.findOneBy({ id: updateDto.equipment_id });
      if (!newEquipmentEntity) {
        throw new NotFoundException(`New equipment with ID "${updateDto.equipment_id}" not found.`);
      }
      if (newEquipmentEntity.status !== EquipmentStatus.AVAILABLE) {
        throw new ConflictException(`New equipment ID "${updateDto.equipment_id}" is ${newEquipmentEntity.status} and cannot be assigned.`);
      }
      // New equipment is valid and available.
    }

    // 2. Validate other foreign keys if they are being changed
    if (updateDto.show_id && updateDto.show_id !== assignment.show_id) {
      const show = await this.showRepository.findOneBy({ id: updateDto.show_id });
      if (!show) throw new NotFoundException(`Show with ID "${updateDto.show_id}" not found.`);
    }
    if (updateDto.user_id && updateDto.user_id !== assignment.user_id) {
      const user = await this.userRepository.findOneBy({ id: updateDto.user_id });
      if (!user) throw new NotFoundException(`User to assign to with ID "${updateDto.user_id}" not found.`);
    }

    // 3. Apply DTO changes to the assignment entity
    const updatePayload = {
      ...updateDto,
      ...(updateDto.assignment_date && { assignment_date: new Date(updateDto.assignment_date) }),
      ...(updateDto.expected_return_date && { expected_return_date: new Date(updateDto.expected_return_date) }),
      ...(updateDto.actual_return_date && { actual_return_date: new Date(updateDto.actual_return_date) }),
    };
    this.assignmentRepository.merge(assignment, updatePayload);
    // if you add updated_by_user_id to entity: assignment.updated_by_user_id = updated_by_user_id;

    // 4. Save the assignment first
    let savedAssignment: EquipmentAssignment;
    try {
      savedAssignment = await this.assignmentRepository.save(assignment);
    } catch (error) {
      this.logger.error(`Failed to save assignment update: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Could not update equipment assignment during save.');
    }

    // 5. Handle equipment status changes
    const newStatus = savedAssignment.status;

    if (newEquipmentEntity) { // Equipment was changed
      // Set new equipment to IN_USE (if assignment is active)
      if (newStatus !== AssignmentStatus.RETURNED) { // Assuming any non-returned status means it's in use by this assignment
        newEquipmentEntity.status = EquipmentStatus.IN_USE;
        await this.equipmentRepository.save(newEquipmentEntity);
      }
      // Make old equipment available (if no other active assignments)
      const oldEquipment = await this.equipmentRepository.findOneBy({ id: originalEquipmentId });
      if (oldEquipment) {
        const otherActiveAssignmentsForOld = await this.assignmentRepository.count({
          where: { equipment_id: originalEquipmentId, status: Not(AssignmentStatus.RETURNED) }
        });
        if (otherActiveAssignmentsForOld === 0) {
          oldEquipment.status = EquipmentStatus.AVAILABLE;
          await this.equipmentRepository.save(oldEquipment);
        }
      }
    } else { // Equipment was not changed, just status or other fields of assignment
      if (newStatus && newStatus !== originalStatus) {
        const currentEquipment = await this.equipmentRepository.findOneBy({ id: savedAssignment.equipment_id });
        if (!currentEquipment) throw new InternalServerErrorException('Current equipment not found for status update.');

        if (newStatus === AssignmentStatus.RETURNED) {
          const otherActiveAssignments = await this.assignmentRepository.count({
            where: { equipment_id: currentEquipment.id, status: Not(AssignmentStatus.RETURNED), id: Not(savedAssignment.id) }
          });
          if (otherActiveAssignments === 0) {
            currentEquipment.status = EquipmentStatus.AVAILABLE;
            await this.equipmentRepository.save(currentEquipment);
          }
        } else if (newStatus === AssignmentStatus.ASSIGNED) { // e.g., from Pending to Assigned
          currentEquipment.status = EquipmentStatus.IN_USE;
          await this.equipmentRepository.save(currentEquipment);
        }
        // Add more transitions like LOST, DAMAGED -> UNDER_MAINTENANCE if needed
      }
    }
    // Re-fetch the assignment to ensure all relations and latest data are returned
    return this.findOne(savedAssignment.id);
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing equipment assignment with id: ${id}`);
    const assignment = await this.findOne(id); // Ensures assignment exists and loads equipment relation

    const equipmentId = assignment.equipment_id;
    const wasActiveAssignment = assignment.status !== AssignmentStatus.RETURNED;

    const result = await this.assignmentRepository.delete(id); // Use delete for @BeforeRemove or soft-delete for @BeforeSoftRemove
    if (result.affected === 0) {
      throw new NotFoundException(`Equipment assignment with ID "${id}" could not be deleted.`);
    }

    if (wasActiveAssignment && equipmentId) {
      const equipment = await this.equipmentRepository.findOneBy({ id: equipmentId });
      if (equipment) {
        const otherActiveAssignments = await this.assignmentRepository.count({
          where: { equipment_id: equipmentId, status: Not(AssignmentStatus.RETURNED) }
        });
        if (otherActiveAssignments === 0) {
          equipment.status = EquipmentStatus.AVAILABLE;
          await this.equipmentRepository.save(equipment);
        }
      }
    }
  }
} 