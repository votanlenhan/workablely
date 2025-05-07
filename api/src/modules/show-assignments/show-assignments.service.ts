import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { paginate, Pagination, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { ShowAssignment, ConfirmationStatus } from './entities/show-assignment.entity';
import { CreateShowAssignmentDto } from './dto/create-show-assignment.dto';
import { UpdateShowAssignmentDto } from './dto/update-show-assignment.dto';
import { ShowsService } from '../shows/shows.service';
import { UsersService } from '../users/users.service';
import { ShowRolesService } from '../show-roles/show-roles.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ShowAssignmentsService {
  constructor(
    @InjectRepository(ShowAssignment)
    private readonly assignmentRepository: Repository<ShowAssignment>,

    // Inject other services needed for validation
    @Inject(forwardRef(() => ShowsService))
    private readonly showsService: ShowsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ShowRolesService))
    private readonly showRolesService: ShowRolesService,
  ) {}

  /**
   * Creates a new show assignment.
   * @param createShowAssignmentDto - The data for the new assignment.
   * @param assignedBy - The user performing the assignment.
   * @returns The newly created show assignment.
   * @throws ConflictException if the user is already assigned to the show.
   */
  async create(createShowAssignmentDto: CreateShowAssignmentDto, assignedBy: User): Promise<ShowAssignment> {
    const { showId, userId, showRoleId } = createShowAssignmentDto;

    // Validate related entities exist BEFORE checking for existing assignment
    await this.showsService.findOne(showId);       // Uncommented and moved up
    await this.usersService.findOneById(userId);    // Uncommented and moved up
    await this.showRolesService.findOne(showRoleId); // Uncommented and moved up

    // Check for existing assignment
    const existingAssignment = await this.assignmentRepository.findOne({
      where: { show_id: showId, user_id: userId },
    });
    if (existingAssignment) {
      throw new ConflictException(`User ${userId} is already assigned to show ${showId}.`);
    }

    const newAssignment = this.assignmentRepository.create({
      show_id: showId,
      user_id: userId,
      show_role_id: showRoleId,
      assigned_by_user_id: assignedBy.id,
      // assigned_at is set by @CreateDateColumn
      // confirmation_status defaults to Pending
    });

    return this.assignmentRepository.save(newAssignment);
  }

  /**
   * Finds all show assignments (potentially paginated).
   * @returns A list of show assignments.
   */
  async findAll(options: IPaginationOptions): Promise<Pagination<ShowAssignment>> {
    // Basic find for now
    // return this.assignmentRepository.find({ relations: ['user', 'show', 'showRole', 'assignedBy'] }); // Old code
    // Example pagination:
    const queryBuilder = this.assignmentRepository.createQueryBuilder('assignment');
    queryBuilder
      .leftJoinAndSelect('assignment.user', 'user')
      .leftJoinAndSelect('assignment.show', 'show')
      .leftJoinAndSelect('assignment.show_role', 'show_role')
      .leftJoinAndSelect('assignment.assignedBy', 'assignedBy')
      .orderBy('assignment.assigned_at', 'DESC'); // Default sort order

    return paginate<ShowAssignment>(queryBuilder, options);
  }

  /**
   * Finds a single show assignment by its ID.
   * @param id - The ID of the show assignment.
   * @returns The found show assignment.
   * @throws NotFoundException if the assignment is not found.
   */
  async findOne(id: string): Promise<ShowAssignment> {
    const options: FindOneOptions<ShowAssignment> = {
      where: { id },
      relations: ['user', 'show', 'show_role', 'assignedBy'],
    };
    const assignment = await this.assignmentRepository.findOne(options);
    if (!assignment) {
      throw new NotFoundException(`ShowAssignment with ID ${id} not found`);
    }
    return assignment;
  }

  /**
   * Updates a show assignment (e.g., confirmation status).
   * @param id - The ID of the assignment to update.
   * @param updateShowAssignmentDto - The data to update.
   * @returns The updated show assignment.
   * @throws NotFoundException if the assignment is not found.
   */
  async update(id: string, updateShowAssignmentDto: UpdateShowAssignmentDto): Promise<ShowAssignment> {
    const assignmentToUpdate = await this.findOne(id);

    let confirmedAtValue: Date | undefined = assignmentToUpdate.confirmed_at ?? undefined;
    const finalStatus = updateShowAssignmentDto.confirmationStatus ?? assignmentToUpdate.confirmation_status;

    if (updateShowAssignmentDto.confirmationStatus) {
      if (finalStatus === ConfirmationStatus.CONFIRMED) {
        confirmedAtValue = new Date();
      } else {
        confirmedAtValue = undefined;
      }
    }

    let declineReasonValue: string | undefined = assignmentToUpdate.decline_reason ?? undefined;
    if (updateShowAssignmentDto.declineReason !== undefined) {
      if (finalStatus === ConfirmationStatus.DECLINED) {
        declineReasonValue = updateShowAssignmentDto.declineReason;
      } else {
        declineReasonValue = undefined;
      }
    } else if (finalStatus !== ConfirmationStatus.DECLINED) {
        declineReasonValue = undefined;
    }
    
    if (finalStatus === ConfirmationStatus.DECLINED && (declineReasonValue === undefined || declineReasonValue.trim() === '')) {
        throw new BadRequestException('Decline reason is required and cannot be empty when status is set to Declined');
    }

    assignmentToUpdate.confirmation_status = finalStatus;
    assignmentToUpdate.decline_reason = declineReasonValue;
    assignmentToUpdate.confirmed_at = confirmedAtValue;

    return this.assignmentRepository.save(assignmentToUpdate);
  }

  /**
   * Removes a show assignment.
   * @param id - The ID of the assignment to remove.
   * @throws NotFoundException if the assignment is not found.
   */
  async remove(id: string): Promise<void> {
    const result = await this.assignmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ShowAssignment with ID ${id} not found`);
    }
  }
} 