import { Test, TestingModule } from '@nestjs/testing';
import { ExternalIncomesController } from './external-incomes.controller';
import { ExternalIncomesService } from './external-incomes.service';
import { CreateExternalIncomeDto } from './dto/create-external-income.dto';
import { UpdateExternalIncomeDto } from './dto/update-external-income.dto';
import { ExternalIncome } from './entities/external-income.entity';
import { User, PlainUser } from '../users/entities/user.entity';
import { Role, RoleName } from '../roles/entities/role.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
import { Pagination } from 'nestjs-typeorm-paginate';
import { CanActivate, ForbiddenException } from '@nestjs/common';

const mockAdminUserId = 'admin-user-uuid';
const mockAdminUser: User = {
  id: mockAdminUserId,
  email: 'admin@example.com',
  first_name: 'Admin',
  last_name: 'User',
  roles: [{ name: RoleName.ADMIN }] as Role[],
  password_hash: 'hashedpassword',
  created_at: new Date(),
  updated_at: new Date(),
  is_active: true,
  phone_number: undefined,
  avatar_url: undefined,
  last_login_at: undefined,
  created_shows: [],
  show_assignments: [],
  assigned_show_assignments: [],
  equipment_assignments: [],
  assigned_equipment_assignments: [],
  recorded_payments: [],
  recorded_expenses: [],
  recorded_external_incomes: [],
  revenue_allocations: [],
  get full_name() { return `${this.first_name} ${this.last_name}`; },
  validatePassword: jest.fn(),
  hashPassword: jest.fn(),
  hashPasswordBeforeInsert: jest.fn(),
  emailToLowerCase: jest.fn(),
  toPlainObject: jest.fn().mockReturnValue({ id: mockAdminUserId, email: 'admin@example.com'} as PlainUser) as () => PlainUser,
  hasId: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  softRemove: jest.fn(),
  recover: jest.fn(),
  reload: jest.fn(),
} as User;

const mockManagerUserId = 'manager-user-uuid';
const mockManagerUser: User = {
  id: mockManagerUserId,
  email: 'manager@example.com',
  first_name: 'Manager',
  last_name: 'User',
  roles: [{ name: RoleName.MANAGER }] as Role[],
  password_hash: 'hashedpassword',
  created_at: new Date(),
  updated_at: new Date(),
  is_active: true,
  phone_number: undefined,
  avatar_url: undefined,
  last_login_at: undefined,
  created_shows: [],
  show_assignments: [],
  assigned_show_assignments: [],
  equipment_assignments: [],
  assigned_equipment_assignments: [],
  recorded_payments: [],
  recorded_expenses: [],
  recorded_external_incomes: [],
  revenue_allocations: [],
  get full_name() { return `${this.first_name} ${this.last_name}`; },
  validatePassword: jest.fn(),
  hashPassword: jest.fn(),
  hashPasswordBeforeInsert: jest.fn(),
  emailToLowerCase: jest.fn(),
  toPlainObject: jest.fn().mockReturnValue({ id: mockManagerUserId, email: 'manager@example.com'} as PlainUser) as () => PlainUser,
  hasId: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  softRemove: jest.fn(),
  recover: jest.fn(),
  reload: jest.fn(),
} as User;

const mockIncomeId = 'ei-controller-uuid-456';
const mockIncomeDate = new Date('2024-03-10T00:00:00.000Z');
const mockExternalIncome: ExternalIncome = {
  id: mockIncomeId,
  description: 'Controller Test EI',
  amount: 1800.75,
  income_date: mockIncomeDate,
  source: 'Book Sales',
  recorded_by_user_id: mockAdminUserId,
  recorded_by_user: mockAdminUser,
  created_at: new Date(),
  updated_at: new Date(),
  notes: 'Q1 Royalties'
};

const mockExternalIncomesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock Guards
const mockJwtAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };
const mockRolesGuard: CanActivate = { canActivate: jest.fn(() => true) };

describe('ExternalIncomesController', () => {
  let controller: ExternalIncomesController;
  let service: ExternalIncomesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalIncomesController],
      providers: [
        {
          provide: ExternalIncomesService,
          useValue: mockExternalIncomesService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard).useValue(mockJwtAuthGuard)
    .overrideGuard(RolesGuard).useValue(mockRolesGuard)
    .compile();

    controller = module.get<ExternalIncomesController>(ExternalIncomesController);
    service = module.get<ExternalIncomesService>(ExternalIncomesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateExternalIncomeDto = {
      description: 'Freelance Gig',
      amount: 500,
      income_date: '2024-04-01',
    };
    const mockReq = { user: mockAdminUser } as AuthenticatedRequest;

    it('should call service.create and return result', async () => {
      mockExternalIncomesService.create.mockResolvedValue(mockExternalIncome as any);
      const result = await controller.create(createDto, mockReq);
      expect(service.create).toHaveBeenCalledWith(createDto, mockAdminUserId);
      expect(result).toEqual(mockExternalIncome);
    });
  });

  describe('findAll', () => {
    const paginatedResult: Pagination<ExternalIncome> = {
      items: [mockExternalIncome],
      meta: { totalItems: 1, itemCount: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
      links: { first: '', previous: '', next: '', last: '' },
    };
    const mockAdminReq = { user: mockAdminUser } as AuthenticatedRequest;
    const mockManagerReq = { user: mockManagerUser } as AuthenticatedRequest;

    it('Admin: should call service.findAll with provided filters', async () => {
      mockExternalIncomesService.findAll.mockResolvedValue(paginatedResult as any);
      const page = 1, limit = 5, year = 2024, month = 4, recordedBy = 'some-user';
      await controller.findAll(mockAdminReq, page, limit, recordedBy, year, month);
      expect(service.findAll).toHaveBeenCalledWith(
        { page, limit, route: 'external-incomes' },
        recordedBy, year, month
      );
    });

    it('Manager: should default recordedByUserId to own ID if not provided', async () => {
      mockExternalIncomesService.findAll.mockResolvedValue(paginatedResult as any);
      const page = 1, limit = 10;
      await controller.findAll(mockManagerReq, page, limit, undefined, undefined, undefined);
      expect(service.findAll).toHaveBeenCalledWith(
        { page, limit, route: 'external-incomes' },
        mockManagerUserId, undefined, undefined
      );
    });
    
    it('Manager: should force recordedByUserId to own ID if trying to query for another user', async () => {
        mockExternalIncomesService.findAll.mockResolvedValue(paginatedResult as any);
        const page = 1, limit = 10;
        await controller.findAll(mockManagerReq, page, limit, 'another-user-id', undefined, undefined);
        expect(service.findAll).toHaveBeenCalledWith(
          { page, limit, route: 'external-incomes' },
          mockManagerUserId, // Forced to own ID
          undefined, undefined
        );
      });
  });

  describe('findOne', () => {
    const mockAdminReq = { user: mockAdminUser } as AuthenticatedRequest;
    const mockManagerReq = { user: mockManagerUser } as AuthenticatedRequest;

    it('Admin: should call service.findOne and return if admin', async () => {
      const incomeByOther = { ...mockExternalIncome, recorded_by_user_id: 'other-user-id' };
      mockExternalIncomesService.findOne.mockResolvedValue(incomeByOther as any);
      const result = await controller.findOne(mockIncomeId, mockAdminReq);
      expect(service.findOne).toHaveBeenCalledWith(mockIncomeId);
      expect(result).toEqual(incomeByOther);
    });

    it('Manager: should call service.findOne and return if owns income', async () => {
      const incomeByManager = { ...mockExternalIncome, recorded_by_user_id: mockManagerUserId };
      mockExternalIncomesService.findOne.mockResolvedValue(incomeByManager as any);
      const result = await controller.findOne(mockIncomeId, mockManagerReq);
      expect(result).toEqual(incomeByManager);
    });

    it('Manager: should throw ForbiddenException if trying to access unowned income', async () => {
      const incomeByOther = { ...mockExternalIncome, recorded_by_user_id: mockAdminUserId }; // recorded by admin
      mockExternalIncomesService.findOne.mockResolvedValue(incomeByOther as any);
      await expect(controller.findOne(mockIncomeId, mockManagerReq)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateExternalIncomeDto = { description: 'Updated EI by Controller' };
    const mockAdminReq = { user: mockAdminUser } as AuthenticatedRequest;
    const mockManagerReq = { user: mockManagerUser } as AuthenticatedRequest;

    it('Admin: should update any income', async () => {
      const incomeByOther = { ...mockExternalIncome, recorded_by_user_id: 'other-user-id' };
      mockExternalIncomesService.findOne.mockResolvedValue(incomeByOther as any); // For the pre-check
      mockExternalIncomesService.update.mockResolvedValue({ ...incomeByOther, ...updateDto } as any);
      
      const result = await controller.update(mockIncomeId, updateDto, mockAdminReq);
      expect(service.update).toHaveBeenCalledWith(mockIncomeId, updateDto);
      expect(result.description).toBe(updateDto.description);
    });

    it('Manager: should update own income', async () => {
      const incomeByManager = { ...mockExternalIncome, recorded_by_user_id: mockManagerUserId };
      mockExternalIncomesService.findOne.mockResolvedValue(incomeByManager as any);
      mockExternalIncomesService.update.mockResolvedValue({ ...incomeByManager, ...updateDto } as any);
      
      await controller.update(mockIncomeId, updateDto, mockManagerReq);
      expect(service.update).toHaveBeenCalledWith(mockIncomeId, updateDto);
    });

    it('Manager: should throw ForbiddenException when trying to update unowned income', async () => {
      const incomeByAdmin = { ...mockExternalIncome, recorded_by_user_id: mockAdminUserId };
      mockExternalIncomesService.findOne.mockResolvedValue(incomeByAdmin as any);
      await expect(controller.update(mockIncomeId, updateDto, mockManagerReq)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    const mockAdminReq = { user: mockAdminUser } as AuthenticatedRequest;
    const mockManagerReq = { user: mockManagerUser } as AuthenticatedRequest;

    it('Admin: should remove any income', async () => {
      const incomeByOther = { ...mockExternalIncome, recorded_by_user_id: 'other-user-id' };
      mockExternalIncomesService.findOne.mockResolvedValue(incomeByOther as any);
      mockExternalIncomesService.remove.mockResolvedValue(undefined);
      await controller.remove(mockIncomeId, mockAdminReq);
      expect(service.remove).toHaveBeenCalledWith(mockIncomeId);
    });

    it('Manager: should remove own income', async () => {
      const incomeByManager = { ...mockExternalIncome, recorded_by_user_id: mockManagerUserId };
      mockExternalIncomesService.findOne.mockResolvedValue(incomeByManager as any);
      mockExternalIncomesService.remove.mockResolvedValue(undefined);
      await controller.remove(mockIncomeId, mockManagerReq);
      expect(service.remove).toHaveBeenCalledWith(mockIncomeId);
    });

    it('Manager: should throw ForbiddenException when trying to delete unowned income', async () => {
      const incomeByAdmin = { ...mockExternalIncome, recorded_by_user_id: mockAdminUserId };
      mockExternalIncomesService.findOne.mockResolvedValue(incomeByAdmin as any);
      await expect(controller.remove(mockIncomeId, mockManagerReq)).rejects.toThrow(ForbiddenException);
    });
  });
}); 