import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { MemberEvaluationsService } from './member-evaluations.service';
import { MemberEvaluation } from './entities/member-evaluation.entity';
import { User } from '../users/entities/user.entity';
import { ShowsService } from '../shows/shows.service';
import { UsersService } from '../users/users.service';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { CreateMemberEvaluationDto } from './dto/create-member-evaluation.dto';
import { UpdateMemberEvaluationDto } from './dto/update-member-evaluation.dto';
import { RoleName } from '../roles/entities/role-name.enum';

type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>> & {
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
  };
const createMockRepository = <T extends ObjectLiteral = any>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

type MockUserServiceType = Partial<Record<keyof UsersService, jest.Mock>> & {
    findOneById: jest.Mock;
};
const createMockUserService = (): MockUserServiceType => ({
  findOneById: jest.fn(),
});

type MockShowServiceType = Partial<Record<keyof ShowsService, jest.Mock>> & {
    findOne: jest.Mock;
};
const createMockShowService = (): MockShowServiceType => ({
  findOne: jest.fn(),
});

describe('MemberEvaluationsService', () => {
  let service: MemberEvaluationsService;
  let repository: MockRepository<MemberEvaluation>;
  let usersService: MockUserServiceType;
  let showsService: MockShowServiceType;

  const mockUser = { id: 'user-uuid-1', email: 'evaluator@example.com', roles: [] } as any as User;
  const mockEvaluatedUser = { id: 'evaluated-user-uuid-2'} as any as User;
  const mockShow = { id: 'show-uuid-1' } as any; 

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberEvaluationsService,
        { provide: getRepositoryToken(MemberEvaluation), useFactory: createMockRepository },
        { provide: UsersService, useFactory: createMockUserService }, 
        { provide: ShowsService, useFactory: createMockShowService }, 
      ],
    }).compile();

    service = module.get<MemberEvaluationsService>(MemberEvaluationsService);
    repository = module.get(getRepositoryToken(MemberEvaluation)) as MockRepository<MemberEvaluation>;
    usersService = module.get<MockUserServiceType>(UsersService);
    showsService = module.get<MockShowServiceType>(ShowsService);

    // Default successful finds for related entities if needed by service methods directly
    // usersService.findOneById.mockResolvedValue(mockEvaluatedUser);
    // showsService.findOne.mockResolvedValue(mockShow);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockEvaluator = { id: 'evaluator-uuid', email: 'evaluator@test.com', roles: [] } as any as User;
    const mockCreateDto: CreateMemberEvaluationDto = {
      show_id: 'show-uuid-for-create',
      evaluated_user_id: 'evaluated-user-uuid-for-create',
      rating: 8,
      comments: 'Good performance',
    };

    it('should successfully create a new evaluation', async () => {
      const expectedEvaluation = {
        id: 'new-evaluation-uuid',
        ...mockCreateDto,
        evaluator_user_id: mockEvaluator.id,
        evaluation_date: expect.any(Date),
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      } as MemberEvaluation;

      showsService.findOne!.mockResolvedValue(mockShow);
      usersService.findOneById!.mockResolvedValue(mockEvaluatedUser);
      repository.findOne!.mockResolvedValue(null);
      repository.create!.mockReturnValue(expectedEvaluation);
      repository.save!.mockResolvedValue(expectedEvaluation);

      const result = await service.create(mockCreateDto, mockEvaluator);

      expect(result).toEqual(expectedEvaluation);
      expect(showsService.findOne).toHaveBeenCalledWith(mockCreateDto.show_id);
      expect(usersService.findOneById).toHaveBeenCalledWith(mockCreateDto.evaluated_user_id);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          show_id: mockCreateDto.show_id,
          evaluated_user_id: mockCreateDto.evaluated_user_id,
        },
      });
      expect(repository.create).toHaveBeenCalledWith({
        ...mockCreateDto,
        evaluator_user_id: mockEvaluator.id,
        evaluation_date: expect.any(Date),
      });
      expect(repository.save).toHaveBeenCalledWith(expectedEvaluation);
    });

    it('should throw NotFoundException if show_id does not exist', async () => {
      showsService.findOne!.mockRejectedValue(new NotFoundException('Show not found'));
      usersService.findOneById!.mockResolvedValue(mockEvaluatedUser);
      repository.findOne!.mockResolvedValue(null);

      await expect(service.create(mockCreateDto, mockEvaluator)).rejects.toThrow(NotFoundException);
      expect(showsService.findOne).toHaveBeenCalledWith(mockCreateDto.show_id);
      expect(usersService.findOneById).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if evaluated_user_id does not exist', async () => {
      showsService.findOne!.mockResolvedValue(mockShow);
      usersService.findOneById!.mockRejectedValue(new NotFoundException('Evaluated user not found'));
      repository.findOne!.mockResolvedValue(null);

      await expect(service.create(mockCreateDto, mockEvaluator)).rejects.toThrow(NotFoundException);
      expect(showsService.findOne).toHaveBeenCalledWith(mockCreateDto.show_id);
      expect(usersService.findOneById).toHaveBeenCalledWith(mockCreateDto.evaluated_user_id);
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if an evaluation already exists for the show and user', async () => {
      const existingEvaluation = { id: 'existing-eval-uuid', ...mockCreateDto } as MemberEvaluation;
      
      showsService.findOne!.mockResolvedValue(mockShow);
      usersService.findOneById!.mockResolvedValue(mockEvaluatedUser);
      repository.findOne!.mockResolvedValue(existingEvaluation);

      await expect(service.create(mockCreateDto, mockEvaluator)).rejects.toThrow(ConflictException);
      expect(showsService.findOne).toHaveBeenCalledWith(mockCreateDto.show_id);
      expect(usersService.findOneById).toHaveBeenCalledWith(mockCreateDto.evaluated_user_id);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          show_id: mockCreateDto.show_id,
          evaluated_user_id: mockCreateDto.evaluated_user_id,
        },
      });
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    // TODO: Add test for ForbiddenException if evaluator is evaluating themselves
  });

  describe('findOne', () => {
    const evaluationId = 'find-this-eval-uuid';
    const mockEvaluation = {
      id: evaluationId,
      show_id: 'show-uuid-for-find',
      evaluated_user_id: 'evaluated-user-uuid-for-find',
      evaluator_user_id: 'evaluator-user-uuid-for-find',
      rating: 7,
      comments: 'Okay.',
      evaluation_date: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    } as MemberEvaluation;

    it('should return an evaluation if found', async () => {
      repository.findOne!.mockResolvedValue(mockEvaluation);

      const result = await service.findOne(evaluationId);
      expect(result).toEqual(mockEvaluation);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: evaluationId },
        relations: ['show', 'evaluatedUser', 'evaluatorUser'],
      });
    });

    it('should throw NotFoundException if evaluation is not found', async () => {
      repository.findOne!.mockResolvedValue(null);

      await expect(service.findOne(evaluationId)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: evaluationId },
        relations: ['show', 'evaluatedUser', 'evaluatorUser'],
      });
    });
  });

  describe('update', () => {
    const evaluationIdToUpdate = 'update-this-eval-uuid';
    const originalEvaluatorId = 'original-evaluator-uuid';
    const anotherUserId = 'another-user-uuid';
    
    const mockOriginalEvaluation = {
      id: evaluationIdToUpdate,
      show_id: 's1', evaluated_user_id: 'eu1', evaluator_user_id: originalEvaluatorId,
      rating: 5, comments: 'Original comment',
      evaluation_date: new Date(), created_at: new Date(), updated_at: new Date(),
    } as MemberEvaluation;

    const mockUpdateDto: UpdateMemberEvaluationDto = {
      rating: 9,
      comments: 'Updated comment',
    };

    const mockCurrentUser = { id: originalEvaluatorId, roles: [] } as any as User;
    const mockAdminUser = { id: 'admin-uuid', roles: [{ name: RoleName.ADMIN } as any] } as any as User;
    const mockOtherUser = { id: anotherUserId, roles: [] } as any as User;

    it('should successfully update an evaluation by the original evaluator', async () => {
      const updatedEvaluation = { ...mockOriginalEvaluation, ...mockUpdateDto, updated_at: expect.any(Date) };
      repository.findOne!.mockResolvedValue(mockOriginalEvaluation);
      repository.save!.mockResolvedValue(updatedEvaluation);

      const result = await service.update(evaluationIdToUpdate, mockUpdateDto, mockCurrentUser);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: evaluationIdToUpdate }, relations: ['show', 'evaluatedUser', 'evaluatorUser'] });
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(mockUpdateDto));
      expect(result).toEqual(updatedEvaluation);
    });

    it('should successfully update an evaluation by an Admin', async () => {
      const updatedEvaluation = { ...mockOriginalEvaluation, ...mockUpdateDto, updated_at: expect.any(Date) };
      repository.findOne!.mockResolvedValue(mockOriginalEvaluation);
      repository.save!.mockResolvedValue(updatedEvaluation);

      const result = await service.update(evaluationIdToUpdate, mockUpdateDto, mockAdminUser);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: evaluationIdToUpdate }, relations: ['show', 'evaluatedUser', 'evaluatorUser'] });
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(mockUpdateDto));
      expect(result).toEqual(updatedEvaluation);
    });

    it('should throw NotFoundException if evaluation to update is not found', async () => {
      repository.findOne!.mockResolvedValue(null);
      await expect(service.update(evaluationIdToUpdate, mockUpdateDto, mockCurrentUser)).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if a non-admin user (not original evaluator) tries to update', async () => {
      repository.findOne!.mockResolvedValue(mockOriginalEvaluation);
      await expect(service.update(evaluationIdToUpdate, mockUpdateDto, mockOtherUser)).rejects.toThrow(ForbiddenException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const evaluationIdToRemove = 'remove-this-eval-uuid';
    const originalEvaluatorId = 'original-evaluator-for-remove';
    const anotherUserId = 'another-user-for-remove';

    const mockEvaluationToRemove = {
      id: evaluationIdToRemove,
      evaluator_user_id: originalEvaluatorId,
    } as any as MemberEvaluation;

    const mockCurrentUser = { id: originalEvaluatorId, roles: [] } as any as User;
    const mockAdminUser = { id: 'admin-uuid-for-remove', roles: [{ name: RoleName.ADMIN } as any] } as any as User;
    const mockOtherUser = { id: anotherUserId, roles: [] } as any as User;

    it('should successfully remove an evaluation by the original evaluator', async () => {
      repository.findOne!.mockResolvedValue(mockEvaluationToRemove);
      repository.delete!.mockResolvedValue({ affected: 1, raw: [] });

      await service.remove(evaluationIdToRemove, mockCurrentUser);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: evaluationIdToRemove }, relations: ['show', 'evaluatedUser', 'evaluatorUser'] });
      expect(repository.delete).toHaveBeenCalledWith(evaluationIdToRemove);
    });

    it('should successfully remove an evaluation by an Admin', async () => {
      repository.findOne!.mockResolvedValue(mockEvaluationToRemove);
      repository.delete!.mockResolvedValue({ affected: 1, raw: [] });

      await service.remove(evaluationIdToRemove, mockAdminUser);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: evaluationIdToRemove }, relations: ['show', 'evaluatedUser', 'evaluatorUser'] });
      expect(repository.delete).toHaveBeenCalledWith(evaluationIdToRemove);
    });

    it('should throw NotFoundException if findOne does not find evaluation to remove', async () => {
      repository.findOne!.mockResolvedValue(null);
      await expect(service.remove(evaluationIdToRemove, mockCurrentUser)).rejects.toThrow(NotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if delete operation affects 0 rows', async () => {
      repository.findOne!.mockResolvedValue(mockEvaluationToRemove);
      repository.delete!.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.remove(evaluationIdToRemove, mockCurrentUser)).rejects.toThrow(NotFoundException);
      expect(repository.delete).toHaveBeenCalledWith(evaluationIdToRemove);
    });

    it('should throw ForbiddenException if a non-admin user (not original evaluator) tries to remove', async () => {
      repository.findOne!.mockResolvedValue(mockEvaluationToRemove);
      await expect(service.remove(evaluationIdToRemove, mockOtherUser)).rejects.toThrow(ForbiddenException);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  describe('findAllByShow', () => {
    const showId = 'find-by-show-uuid';
    const mockEvaluations = [
      { id: 'eval1', show_id: showId }, 
      { id: 'eval2', show_id: showId }
    ] as MemberEvaluation[];

    it('should return an array of evaluations for a given showId', async () => {
      repository.find!.mockResolvedValue(mockEvaluations);
      const result = await service.findAllByShow(showId);
      expect(result).toEqual(mockEvaluations);
      expect(repository.find).toHaveBeenCalledWith({
        where: { show_id: showId },
        relations: ['evaluatedUser', 'evaluatorUser'],
      });
    });

    it('should return an empty array if no evaluations found for the showId', async () => {
      repository.find!.mockResolvedValue([]);
      const result = await service.findAllByShow(showId);
      expect(result).toEqual([]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { show_id: showId },
        relations: ['evaluatedUser', 'evaluatorUser'],
      });
    });
  });

  describe('findAllByEvaluatedUser', () => {
    const userId = 'find-by-user-uuid';
    const mockEvaluations = [
      { id: 'eval3', evaluated_user_id: userId }, 
      { id: 'eval4', evaluated_user_id: userId }
    ] as MemberEvaluation[];

    it('should return an array of evaluations for a given userId', async () => {
      repository.find!.mockResolvedValue(mockEvaluations);
      const result = await service.findAllByEvaluatedUser(userId);
      expect(result).toEqual(mockEvaluations);
      expect(repository.find).toHaveBeenCalledWith({
        where: { evaluated_user_id: userId },
        relations: ['show', 'evaluatorUser'],
      });
    });

    it('should return an empty array if no evaluations found for the userId', async () => {
      repository.find!.mockResolvedValue([]);
      const result = await service.findAllByEvaluatedUser(userId);
      expect(result).toEqual([]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { evaluated_user_id: userId },
        relations: ['show', 'evaluatorUser'],
      });
    });
  });
}); 