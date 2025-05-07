import { Injectable, NotFoundException, ForbiddenException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemberEvaluation } from './entities/member-evaluation.entity';
import { CreateMemberEvaluationDto } from './dto/create-member-evaluation.dto';
import { UpdateMemberEvaluationDto } from './dto/update-member-evaluation.dto';
import { User } from '../users/entities/user.entity';
import { ShowsService } from '../shows/shows.service';
import { UsersService } from '../users/users.service';
import { paginate, Pagination, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { RoleName } from '../roles/entities/role-name.enum'; // For checking roles
import { Brackets } from 'typeorm';

@Injectable()
export class MemberEvaluationsService {
  constructor(
    @InjectRepository(MemberEvaluation)
    private readonly evaluationRepository: Repository<MemberEvaluation>,
    @Inject(forwardRef(() => ShowsService))
    private readonly showsService: ShowsService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async create(
    createDto: CreateMemberEvaluationDto,
    evaluator: User,
  ): Promise<MemberEvaluation> {
    // 1. Ensure show_id exists
    await this.showsService.findOne(createDto.show_id); // Throws NotFoundException if not found

    // 2. Ensure evaluated_user_id exists
    await this.usersService.findOneById(createDto.evaluated_user_id); // Throws NotFoundException if not found

    // 3. Ensure evaluator is not evaluating themselves
    if (evaluator.id === createDto.evaluated_user_id) {
      throw new ForbiddenException('Users cannot evaluate themselves.');
    }

    // 4. Check for existing evaluation (Unique constraint handles DB level, but good to check in service too)
    const existingEvaluation = await this.evaluationRepository.findOne({
      where: {
        show_id: createDto.show_id,
        evaluated_user_id: createDto.evaluated_user_id,
      },
    });

    if (existingEvaluation) {
      throw new ConflictException(
        `An evaluation already exists for user ${createDto.evaluated_user_id} on show ${createDto.show_id}.`,
      );
    }

    const newEvaluation = this.evaluationRepository.create({
      ...createDto,
      evaluator_user_id: evaluator.id,
      evaluation_date: new Date(), // Or rely on DB default in entity
    });
    return this.evaluationRepository.save(newEvaluation);
  }

  async findAllPaginated(
    options: IPaginationOptions,
    currentUser: User,
  ): Promise<Pagination<MemberEvaluation>> {
    const queryBuilder = this.evaluationRepository.createQueryBuilder('evaluation');
    queryBuilder
      .leftJoinAndSelect('evaluation.show', 'show')
      .leftJoinAndSelect('evaluation.evaluatedUser', 'evaluatedUser')
      .leftJoinAndSelect('evaluation.evaluatorUser', 'evaluatorUser')
      .orderBy('evaluation.evaluation_date', 'DESC');

    const isAdmin = currentUser.roles?.some(role => role.name === RoleName.ADMIN);
    const isManager = currentUser.roles?.some(role => role.name === RoleName.MANAGER);

    if (isAdmin) {
      // Admin sees all, no additional filters needed.
    } else if (isManager) {
      // Manager sees evaluations they made OR evaluations about users (if they were the evaluator).
      // This implies they can see evaluations they created for others.
      // And evaluations where they are the one being evaluated (covered by the USER case too if a manager is also a user)
      queryBuilder.where(new Brackets(qb => {
        qb.where('evaluation.evaluator_user_id = :currentUserId', { currentUserId: currentUser.id })
          .orWhere('evaluation.evaluated_user_id = :currentUserId', { currentUserId: currentUser.id });
      }));
    } else { // Regular User (not Admin, not Manager)
      // Regular Users should ONLY see evaluations made ABOUT them.
      queryBuilder.where('evaluation.evaluated_user_id = :currentUserId', {
        currentUserId: currentUser.id,
      });
    }

    return paginate<MemberEvaluation>(queryBuilder, options);
  }

  async findAllByShow(showId: string): Promise<MemberEvaluation[]> {
    return this.evaluationRepository.find({
      where: { show_id: showId },
      relations: ['evaluatedUser', 'evaluatorUser'], // Populate related users
    });
  }

  async findAllByEvaluatedUser(userId: string): Promise<MemberEvaluation[]> {
    return this.evaluationRepository.find({
      where: { evaluated_user_id: userId },
      relations: ['show', 'evaluatorUser'],
    });
  }

  async findOne(id: string, currentUser?: User): Promise<MemberEvaluation> {
    const evaluation = await this.evaluationRepository.findOne({
      where: { id },
      relations: ['show', 'evaluatedUser', 'evaluatorUser'],
    });
    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }

    // RBAC for findOne
    if (currentUser) {
      const isAdmin = currentUser.roles?.some(role => role.name === RoleName.ADMIN);
      const isEvaluator = evaluation.evaluator_user_id === currentUser.id;
      const isEvaluated = evaluation.evaluated_user_id === currentUser.id;

      if (!isAdmin && !isEvaluator && !isEvaluated) {
        throw new ForbiddenException('You are not authorized to view this evaluation.');
      }
    }
    // If no currentUser is passed (e.g. service-to-service call), or if authorized, return evaluation
    return evaluation;
  }

  async update(
    id: string,
    updateDto: UpdateMemberEvaluationDto,
    currentUser: User,
  ): Promise<MemberEvaluation> {
    const evaluation = await this.findOne(id);

    // Authorization: Only the original evaluator or an Admin can update
    // TODO: Implement Role check for Admin (e.g., check currentUser.roles)
    const isAdmin = currentUser.roles?.some(role => role.name === 'Admin'); // Basic Admin check
    if (evaluation.evaluator_user_id !== currentUser.id && !isAdmin) {
      throw new ForbiddenException('You are not authorized to update this evaluation.');
    }

    Object.assign(evaluation, updateDto);
    return this.evaluationRepository.save(evaluation);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const evaluation = await this.findOne(id);

    // Authorization: Only the original evaluator or an Admin can delete
    // TODO: Implement Role check for Admin (e.g., check currentUser.roles)
    const isAdmin = currentUser.roles?.some(role => role.name === 'Admin'); // Basic Admin check
    if (evaluation.evaluator_user_id !== currentUser.id && !isAdmin) {
      throw new ForbiddenException('You are not authorized to delete this evaluation.');
    }

    const result = await this.evaluationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }
  }
} 