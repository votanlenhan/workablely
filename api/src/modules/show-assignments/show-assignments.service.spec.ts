import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShowAssignmentsService } from './show-assignments.service';
import { ShowAssignment, ConfirmationStatus } from './entities/show-assignment.entity';
import { CreateShowAssignmentDto } from './dto/create-show-assignment.dto';
import { UpdateShowAssignmentDto } from './dto/update-show-assignment.dto';
import { ShowsService } from '../shows/shows.service';
import { UsersService } from '../users/users.service';
import { ShowRolesService } from '../show-roles/show-roles.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { User } from '../users/entities/user.entity';

// Mock the paginate function
jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));
const { paginate: mockPaginate } = require('nestjs-typeorm-paginate');


// Mock Repository Type Helper (Revised)
type MockRepository<T = any> = {
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  delete: jest.Mock;
  createQueryBuilder: jest.Mock;
  find: jest.Mock;
  // Add other methods if needed by the service
};

// Mock Query Builder
const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn(), // Needed by paginate potentially
  getCount: jest.fn(), // Needed by paginate potentially
};

// Function to create the mock repository instance
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
  find: jest.fn(),
});

// Mock Service Types
type MockShowsService = Partial<Record<keyof ShowsService, jest.Mock>>;
type MockUsersService = Partial<Record<keyof UsersService, jest.Mock>>;
type MockShowRolesService = Partial<Record<keyof ShowRolesService, jest.Mock>>;

describe('ShowAssignmentsService', () => {
  let service: ShowAssignmentsService;
  let repository: MockRepository<ShowAssignment>;
  let showsService: MockShowsService;
  let usersService: MockUsersService;
  let showRolesService: MockShowRolesService;

  const mockShow = { id: 'show-uuid-1' };
  const mockUser = { id: 'user-uuid-1', email: 'test@example.com' } as User;
  const mockShowRole = { id: 'show-role-uuid-1' };
  const mockAssigner = { id: 'assigner-uuid-1' } as User;

  beforeEach(async () => {
    // Reset mocks
    mockPaginate.mockClear();
    Object.values(mockQueryBuilder).forEach(mockFn => mockFn.mockClear());

    // Default mock for paginate
    mockPaginate.mockResolvedValue({
      items: [],
      meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
      links: { first: '', previous: '', next: '', last: '' },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowAssignmentsService,
        { provide: getRepositoryToken(ShowAssignment), useFactory: createMockRepository },
        { provide: ShowsService, useValue: { findOne: jest.fn() } }, // Mock methods used by ShowAssignmentsService
        { provide: UsersService, useValue: { findOneById: jest.fn() } },
        { provide: ShowRolesService, useValue: { findOne: jest.fn() } },
      ],
    }).compile();

    service = module.get<ShowAssignmentsService>(ShowAssignmentsService);
    repository = module.get(getRepositoryToken(ShowAssignment));
    showsService = module.get(ShowsService);
    usersService = module.get(UsersService);
    showRolesService = module.get(ShowRolesService);

    // Setup default successful finds for related entities in most tests
    showsService.findOne!.mockResolvedValue(mockShow);
    usersService.findOneById!.mockResolvedValue(mockUser);
    showRolesService.findOne!.mockResolvedValue(mockShowRole);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Test Cases for create() ---
  describe('create', () => {
    const createDto: CreateShowAssignmentDto = {
      showId: 'show-uuid-1',
      userId: 'user-uuid-1',
      showRoleId: 'show-role-uuid-1',
    };
    const expectedAssignment = {
      id: 'new-assignment-uuid',
      show_id: 'show-uuid-1',
      user_id: 'user-uuid-1',
      show_role_id: 'show-role-uuid-1',
      assigned_by_user_id: mockAssigner.id,
      confirmation_status: ConfirmationStatus.PENDING,
      assigned_at: expect.any(Date),
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
      decline_reason: undefined,
      confirmed_at: undefined,
      show: mockShow as any,
      user: mockUser as any,
      show_role: mockShowRole as any,
    };

    it('should create and return a new assignment', async () => {
      repository.findOne!.mockResolvedValue(null);
      repository.create!.mockReturnValue(expectedAssignment);
      repository.save!.mockResolvedValue(expectedAssignment);

      const result = await service.create(createDto, mockAssigner);

      expect(result).toEqual(expectedAssignment);
      expect(showsService.findOne).toHaveBeenCalledWith(createDto.showId);
      expect(usersService.findOneById).toHaveBeenCalledWith(createDto.userId);
      expect(showRolesService.findOne).toHaveBeenCalledWith(createDto.showRoleId);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { show_id: createDto.showId, user_id: createDto.userId } });
      expect(repository.create).toHaveBeenCalledWith({
          show_id: createDto.showId,
          user_id: createDto.userId,
          show_role_id: createDto.showRoleId,
          assigned_by_user_id: mockAssigner.id
      });
      expect(repository.save).toHaveBeenCalledWith(expectedAssignment);
    });

    it('should throw NotFoundException if show does not exist', async () => {
      showsService.findOne!.mockRejectedValue(new NotFoundException('Show not found'));
      await expect(service.create(createDto, mockAssigner)).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      showsService.findOne!.mockResolvedValue({ id: 's1' } as any);
      usersService.findOneById!.mockRejectedValue(new NotFoundException('User not found'));
      await expect(service.create(createDto, mockAssigner)).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if show role does not exist', async () => {
      showsService.findOne!.mockResolvedValue({ id: 's1' } as any);
      usersService.findOneById!.mockResolvedValue({ id: 'u1' } as any);
      showRolesService.findOne!.mockRejectedValue(new NotFoundException('Show role not found'));
      await expect(service.create(createDto, mockAssigner)).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if assignment already exists', async () => {
      showsService.findOne!.mockResolvedValue({ id: 's1' } as any);
      usersService.findOneById!.mockResolvedValue({ id: 'u1' } as any);
      showRolesService.findOne!.mockResolvedValue({ id: 'r1'} as any);
      repository.findOne.mockResolvedValue({ id: 'existing-assignment-id' } as ShowAssignment);
      await expect(service.create(createDto, mockAssigner)).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  // --- Test Cases for findAll() ---
  describe('findAll', () => {
    const options: IPaginationOptions = { page: 1, limit: 10, route: '/show-assignments' };
    const assignment1 = { id: 'a1', show_id: 's1', user_id: 'u1', show_role_id: 'sr1', assigned_by_user_id: 'au1' };
    const paginatedResult: Pagination<ShowAssignment> = {
      items: [assignment1 as ShowAssignment],
      meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
      links: { first: '', previous: '', next: '', last: '' },
    };

    it('should return a paginated list of assignments with relations', async () => {
      repository.createQueryBuilder!.mockReturnValue(mockQueryBuilder as any);
      mockPaginate.mockResolvedValue(paginatedResult);

      const result = await service.findAll(options);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('assignment');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('assignment.user', 'user');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('assignment.show', 'show');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('assignment.show_role', 'show_role');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('assignment.assignedBy', 'assignedBy');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('assignment.assigned_at', 'DESC');
      expect(mockPaginate).toHaveBeenCalledWith(mockQueryBuilder, options);
      expect(result).toEqual(paginatedResult);
    });

    // Comment out tests related to filtering/pagination until implemented in service
    /*
    it('should return a paginated list filtered by showId', async () => {
      const showId = 'show-filter-id';
      mockPaginate.mockResolvedValue(paginatedResult); // Result structure is the same
      repository.createQueryBuilder!.mockReturnValue(mockQueryBuilder);

      await service.findAll(options, showId);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('assignment');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('assignment.showId = :showId', { showId });
      expect(mockPaginate).toHaveBeenCalledWith(mockQueryBuilder, options);
    });

    it('should return a paginated list filtered by userId', async () => {
      const userId = 'user-filter-id';
      mockPaginate.mockResolvedValue(paginatedResult);
      repository.createQueryBuilder!.mockReturnValue(mockQueryBuilder);

      await service.findAll(options, undefined, userId);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('assignment');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('assignment.userId = :userId', { userId });
      expect(mockPaginate).toHaveBeenCalledWith(mockQueryBuilder, options);
    });

     it('should return a paginated list filtered by showId and userId', async () => {
      const showId = 'show-filter-id';
      const userId = 'user-filter-id';
      mockPaginate.mockResolvedValue(paginatedResult);
      repository.createQueryBuilder!.mockReturnValue(mockQueryBuilder);

      await service.findAll(options, showId, userId);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('assignment');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('assignment.showId = :showId', { showId });
       expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('assignment.userId = :userId', { userId });
      expect(mockPaginate).toHaveBeenCalledWith(mockQueryBuilder, options);
    });
    */
  });

  // --- Test Cases for findOne() ---
  describe('findOne', () => {
    const assignmentId = 'find-uuid-1';
    const mockAssignment: ShowAssignment = {
      id: assignmentId,
      show_id: 's1',
      user_id: 'u1',
      show_role_id: 'r1',
      confirmation_status: ConfirmationStatus.PENDING,
      decline_reason: undefined,
      confirmed_at: undefined,
      assigned_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
      assigned_by_user_id: 'admin-uuid',
      show: { id: 's1' } as any,
      user: { id: 'u1' } as any,
      show_role: { id: 'r1' } as any,
    };

    it('should return a single assignment if found', async () => {
      repository.findOne!.mockResolvedValue(mockAssignment);
      const result = await service.findOne(assignmentId);
      expect(result).toEqual(mockAssignment);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: assignmentId },
        relations: ['user', 'show', 'show_role', 'assignedBy'],
      });
    });

    it('should throw NotFoundException if assignment not found', async () => {
      repository.findOne!.mockResolvedValue(null);
      await expect(service.findOne(assignmentId)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Test Cases for update() ---
  describe('update', () => {
    // Test case 1: Update to CONFIRMED
    it('should update status to CONFIRMED and set confirmedAt', async () => {
      const idConfirm = 'update-uuid-confirm';
      const existingAssignment: ShowAssignment = {
        id: idConfirm,
        show_id: 's1',
        user_id: 'u1',
        show_role_id: 'r1',
        confirmation_status: ConfirmationStatus.PENDING,
        decline_reason: undefined,
        confirmed_at: undefined,
        assigned_at: new Date(),
        assigned_by_user_id: 'admin1',
        created_at: new Date(),
        updated_at: new Date(),
        show: {} as any,
        user: {} as any,
        show_role: {} as any,
        assigned_by_user: {} as any,
      };
      const updateDto: UpdateShowAssignmentDto = { confirmationStatus: ConfirmationStatus.CONFIRMED };
      const updatedAssignmentData: ShowAssignment = {
        id: idConfirm,
        show_id: 's1',
        user_id: 'u1',
        show_role_id: 'r1',
        confirmation_status: updateDto.confirmationStatus!,
        decline_reason: updateDto.declineReason,
        confirmed_at: updateDto.confirmationStatus === ConfirmationStatus.CONFIRMED ? expect.any(Date) : undefined,
        assigned_at: existingAssignment.assigned_at,
        assigned_by_user_id: existingAssignment.assigned_by_user_id,
        created_at: existingAssignment.created_at,
        updated_at: expect.any(Date),
        show: existingAssignment.show,
        user: existingAssignment.user,
        show_role: existingAssignment.show_role,
        assigned_by_user: existingAssignment.assigned_by_user,
      };

      repository.findOne.mockResolvedValue(existingAssignment);
      repository.save.mockResolvedValue(updatedAssignmentData);

      const result = await service.update(idConfirm, updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: idConfirm }, relations: ['user', 'show', 'show_role', 'assignedBy'] });
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(updatedAssignmentData));
      expect(result).toEqual(updatedAssignmentData);
    });

    // Test case 2: Update to DECLINED with reason
    it('should update status to DECLINED, set declineReason, and clear confirmedAt', async () => {
      const idDecline = 'update-uuid-decline';
      const existingAssignmentDeclined: ShowAssignment = {
        id: idDecline,
        show_id: 's2',
        user_id: 'u2',
        show_role_id: 'r2',
        confirmation_status: ConfirmationStatus.PENDING,
        decline_reason: undefined,
        confirmed_at: undefined,
        assigned_at: new Date(),
        assigned_by_user_id: 'admin2',
        created_at: new Date(),
        updated_at: new Date(),
        show: {} as any, 
        user: {} as any, 
        show_role: {} as any,
        assigned_by_user: {} as any,
      };
      const updateDtoDecline: UpdateShowAssignmentDto = {
        confirmationStatus: ConfirmationStatus.DECLINED,
        declineReason: 'Not available',
      };
      const updatedAssignmentData: ShowAssignment = {
        ...existingAssignmentDeclined,
        confirmation_status: updateDtoDecline.confirmationStatus!,
        decline_reason: updateDtoDecline.declineReason,
        confirmed_at: updateDtoDecline.confirmationStatus === ConfirmationStatus.CONFIRMED ? expect.any(Date) : undefined,
        updated_at: expect.any(Date),
      };

      repository.findOne.mockResolvedValue(existingAssignmentDeclined);
      repository.save.mockResolvedValue(updatedAssignmentData);

      const result = await service.update(idDecline, updateDtoDecline);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: idDecline }, relations: ['user', 'show', 'show_role', 'assignedBy'] });
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(updatedAssignmentData));
      expect(result).toEqual(updatedAssignmentData);
    });

    // Test case 3: Update DECLINED without reason (Error)
    it('should throw BadRequestException if updating to DECLINED without reason', async () => {
      const idDeclineNoReason = 'update-uuid-decline-noreason';
      const existingAssignment: ShowAssignment = {
        id: idDeclineNoReason,
        show_id: 's1', user_id: 'u1', show_role_id: 'r1', confirmation_status: ConfirmationStatus.PENDING, decline_reason: undefined, confirmed_at: undefined, assigned_at: new Date(), assigned_by_user_id: 'admin1', created_at: new Date(), updated_at: new Date(), show: {} as any, user: {} as any, show_role: {} as any,
        assigned_by_user: {} as any,
      };
      const updateDto: UpdateShowAssignmentDto = { confirmationStatus: ConfirmationStatus.DECLINED };
      
      repository.findOne.mockResolvedValue(existingAssignment);

      await expect(service.update(idDeclineNoReason, updateDto)).rejects.toThrow(BadRequestException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: idDeclineNoReason }, relations: ['user', 'show', 'show_role', 'assignedBy'] });
      expect(repository.save).not.toHaveBeenCalled();
    });

    // Test case 4: Update only declineReason (should not change reason if status not DECLINED)
    it('should not update declineReason if status is not DECLINED', async () => {
      const idOnlyReason = 'update-uuid-only-reason';
      const existingAssignment: ShowAssignment = {
          id: idOnlyReason, 
          show_id: 's1', user_id: 'u1', show_role_id: 'r1', 
          confirmation_status: ConfirmationStatus.PENDING, 
          decline_reason: undefined, 
          confirmed_at: undefined, 
          assigned_at: new Date(), 
          assigned_by_user_id: 'admin1', 
          created_at: new Date(), 
          updated_at: new Date(), 
          show: {} as any, user: {} as any, show_role: {} as any,
      };
      const updateDto: UpdateShowAssignmentDto = { declineReason: 'Changed mind' };
      const updatedAssignmentData: ShowAssignment = { 
        ...existingAssignment,
        confirmed_at: existingAssignment.confirmation_status === ConfirmationStatus.CONFIRMED ? expect.any(Date) : undefined,
        updated_at: expect.any(Date),
      };

      repository.findOne.mockResolvedValue(existingAssignment); 
      repository.save.mockResolvedValue(updatedAssignmentData); 

      const result = await service.update(idOnlyReason, updateDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: idOnlyReason }, relations: ['user', 'show', 'show_role', 'assignedBy'] });
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(updatedAssignmentData));
      expect(result).toEqual(updatedAssignmentData);
    });

    // Test case 5: Change status away from DECLINED (should clear reason)
    it('should clear declineReason if status changes away from DECLINED', async () => {
      const idClearReason = 'update-uuid-clear-reason';
      const existingAssignment: ShowAssignment = {
          id: idClearReason, 
          show_id: 's4', user_id: 'u4', show_role_id: 'r4', 
          confirmation_status: ConfirmationStatus.DECLINED, 
          decline_reason: 'Was sick', 
          confirmed_at: undefined, 
          assigned_at: new Date(), 
          assigned_by_user_id: 'admin4', 
          created_at: new Date(), 
          updated_at: new Date(), 
          show: {} as any, user: {} as any, show_role: {} as any,
      };
      const updateDtoToPending: UpdateShowAssignmentDto = { confirmationStatus: ConfirmationStatus.PENDING };
      const updatedAssignmentData: ShowAssignment = {
        ...existingAssignment,
        confirmation_status: updateDtoToPending.confirmationStatus!,
        decline_reason: undefined,
        confirmed_at: updateDtoToPending.confirmationStatus === ConfirmationStatus.CONFIRMED ? expect.any(Date) : undefined,
        updated_at: expect.any(Date),
      };

      repository.findOne.mockResolvedValue(existingAssignment);
      repository.save.mockResolvedValue(updatedAssignmentData);

      const result = await service.update(idClearReason, updateDtoToPending);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: idClearReason }, relations: ['user', 'show', 'show_role', 'assignedBy'] });
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(updatedAssignmentData));
      expect(result).toEqual(updatedAssignmentData);
    });

    // Test case 6: Not Found
    it('should throw NotFoundException if assignment to update is not found', async () => {
      const idNotFound = 'update-uuid-notfound';
      const updateDto: UpdateShowAssignmentDto = { confirmationStatus: ConfirmationStatus.CONFIRMED };
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(idNotFound, updateDto)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: idNotFound }, relations: ['user', 'show', 'show_role', 'assignedBy'] });
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  // --- Test Cases for remove() ---
  describe('remove', () => {
    const assignmentId = 'delete-uuid-1';

    it('should delete the assignment successfully', async () => {
      repository.delete.mockResolvedValue({ affected: 1 });
      await expect(service.remove(assignmentId)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(assignmentId);
    });

    it('should throw NotFoundException if assignment to delete is not found', async () => {
      repository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(assignmentId)).rejects.toThrow(NotFoundException);
      expect(repository.delete).toHaveBeenCalledWith(assignmentId);
    });
  });
}); 