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
      .leftJoinAndSelect('assignment.assigned_by_user', 'assignedBy')
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
      relations: ['user', 'show', 'show_role', 'assigned_by_user'],
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
   * Confirms a show assignment.
   * @param id The ID of the assignment to confirm.
   * @param currentUser The user performing the action (for potential permission checks).
   * @returns The confirmed show assignment.
   * @throws NotFoundException if the assignment is not found.
   */
  async confirm(id: string, currentUser: User): Promise<ShowAssignment> {
    const assignment = await this.findOne(id);
    // Optional: Add permission check here (e.g., only assigned user or admin/manager can confirm)
    // if (assignment.user_id !== currentUser.id && !currentUser.roles.some(r => r.name === RoleName.ADMIN || r.name === RoleName.MANAGER)) {
    //   throw new ForbiddenException('You do not have permission to confirm this assignment.');
    // }
    assignment.confirmation_status = ConfirmationStatus.CONFIRMED;
    assignment.confirmed_at = new Date();
    assignment.decline_reason = undefined; // Clear decline reason if any
    return this.assignmentRepository.save(assignment);
  }

  /**
   * Declines a show assignment.
   * @param id The ID of the assignment to decline.
   * @param declineReason The reason for declining.
   * @param currentUser The user performing the action.
   * @returns The declined show assignment.
   * @throws NotFoundException if the assignment is not found.
   * @throws BadRequestException if the decline reason is empty.
   */
  async decline(id: string, declineReason: string | undefined, currentUser: User): Promise<ShowAssignment> {
    if (!declineReason || declineReason.trim() === '') {
      throw new BadRequestException('Decline reason is required and cannot be empty.');
    }
    const assignment = await this.findOne(id);
    // Optional: Add permission check here
    assignment.confirmation_status = ConfirmationStatus.DECLINED;
    assignment.decline_reason = declineReason;
    assignment.confirmed_at = undefined; // Clear confirmed date if any
    return this.assignmentRepository.save(assignment);
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

  /**
   * Finds all assignments for a specific show (paginated).
   * @param showId - The ID of the show.
   * @param options - Pagination options.
   * @returns A paginated list of show assignments for the specified show.
   */
  async findAllByShowId(showId: string, options: IPaginationOptions): Promise<Pagination<ShowAssignment>> {
    // Ensure the show actually exists first (optional but good practice)
    await this.showsService.findOne(showId);

    const queryBuilder = this.assignmentRepository.createQueryBuilder('assignment');
    queryBuilder
      .where('assignment.show_id = :showId', { showId })
      .leftJoinAndSelect('assignment.user', 'user')
      .leftJoinAndSelect('assignment.show', 'show') // Keep show relation if needed in the response
      .leftJoinAndSelect('assignment.show_role', 'show_role')
      .leftJoinAndSelect('assignment.assigned_by_user', 'assignedByUser') // Use correct relation name here too
      .orderBy('assignment.assigned_at', 'DESC'); // Or sort by role name, etc.

    return paginate<ShowAssignment>(queryBuilder, options);
  }

  /**
   * Finds all assignments for a specific user (paginated).
   * @param userId - The ID of the user.
   * @param options - Pagination options.
   * @returns A paginated list of show assignments for the specified user.
   */
  async findAllByUserId(userId: string, options: IPaginationOptions): Promise<Pagination<ShowAssignment>> {
    // Ensure the user actually exists first (optional)
    await this.usersService.findOneById(userId);

    const queryBuilder = this.assignmentRepository.createQueryBuilder('assignment');
    queryBuilder
      .where('assignment.user_id = :userId', { userId })
      .leftJoinAndSelect('assignment.user', 'user') // Keep user relation if needed
      .leftJoinAndSelect('assignment.show', 'show') 
      .leftJoinAndSelect('assignment.show_role', 'show_role')
      .leftJoinAndSelect('assignment.assigned_by_user', 'assignedByUser')
      .orderBy('assignment.assigned_at', 'DESC');

    return paginate<ShowAssignment>(queryBuilder, options);
  }
} 