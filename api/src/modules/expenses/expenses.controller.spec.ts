import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './entities/expense.entity';
import { User, PlainUser } from '../users/entities/user.entity';
import { Role, RoleName } from '../roles/entities/role.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
import { Pagination } from 'nestjs-typeorm-paginate';
import { CanActivate } from '@nestjs/common';

const mockUserId = 'user-uuid';
const mockUser: User = {
  id: mockUserId,
  email: 'test@example.com',
  first_name: 'Test',
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
  toPlainObject: jest.fn().mockReturnValue({ id: mockUserId, email: 'test@example.com'} as PlainUser) as () => PlainUser,
  hasId: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  softRemove: jest.fn(),
  recover: jest.fn(),
  reload: jest.fn(),
} as User;

const mockExpenseId = 'expense-controller-uuid-789';
const mockExpenseDate = new Date('2024-07-30T00:00:00.000Z');
const mockExpense: Expense = {
  id: mockExpenseId,
  description: 'Controller Test Expense',
  amount: 150.25,
  expense_date: mockExpenseDate,
  category: 'Controller Category',
  is_wishlist_expense: false,
  recorded_by_user_id: mockUserId,
  recorded_by_user: mockUser,
  created_at: new Date(),
  updated_at: new Date(),
  payment_method: 'Card',
  vendor: 'Test Vendor',
  notes: 'Test notes for controller mock expense',
  receipt_url: 'http://example.com/receipt.jpg'
};

const mockExpensesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock Guards
const mockJwtAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };
const mockRolesGuard: CanActivate = { canActivate: jest.fn(() => true) };

describe('ExpensesController', () => {
  let controller: ExpensesController;
  let service: ExpensesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [
        {
          provide: ExpensesService,
          useValue: mockExpensesService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard).useValue(mockJwtAuthGuard)
    .overrideGuard(RolesGuard).useValue(mockRolesGuard)
    .compile();

    controller = module.get<ExpensesController>(ExpensesController);
    service = module.get<ExpensesService>(ExpensesService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateExpenseDto = {
      description: 'New Expense from Controller',
      amount: 300,
      expense_date: '2024-08-05',
      category: 'Office Supplies',
    };
    const mockReq = { user: { id: mockUserId } } as AuthenticatedRequest;

    it('should call expensesService.create and return the result', async () => {
      mockExpensesService.create.mockResolvedValue(mockExpense as any);
      const result = await controller.create(createDto, mockReq);
      expect(service.create).toHaveBeenCalledWith(createDto, mockUserId);
      expect(result).toEqual(mockExpense);
    });
  });

  describe('findAll', () => {
    const paginatedResult: Pagination<Expense> = {
      items: [mockExpense],
      meta: { totalItems: 1, itemCount: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
      links: { first: '', previous: '', next: '', last: '' },
    };

    it('should call expensesService.findAll and return paginated results', async () => {
      mockExpensesService.findAll.mockResolvedValue(paginatedResult as any);
      const page = 1, limit = 10;
      const result = await controller.findAll(page, limit, undefined, undefined, undefined, undefined, undefined);
      expect(service.findAll).toHaveBeenCalledWith(
        { page, limit, route: '/api/expenses' }, 
        { recorded_by_user_id: undefined, category: undefined, is_wishlist_expense: undefined, month: undefined, year: undefined }
      );
      expect(result).toEqual(paginatedResult);
    });
    
    it('should pass filters to expensesService.findAll', async () => {
        mockExpensesService.findAll.mockResolvedValue(paginatedResult as any);
        const page = 1, limit = 5;
        const recordedBy = 'some-user-id';
        const category = 'Travel';
        const isWishlist = true;
        const month = 12;
        const year = 2023;

        await controller.findAll(page, limit, recordedBy, category, isWishlist, month, year);
        expect(service.findAll).toHaveBeenCalledWith(
            { page, limit, route: '/api/expenses' },
            { recorded_by_user_id: recordedBy, category, is_wishlist_expense: isWishlist, month, year }
        );
    });
  });

  describe('findOne', () => {
    it('should call expensesService.findOne and return the result', async () => {
      mockExpensesService.findOne.mockResolvedValue(mockExpense as any);
      const result = await controller.findOne(mockExpenseId);
      expect(service.findOne).toHaveBeenCalledWith(mockExpenseId);
      expect(result).toEqual(mockExpense);
    });
  });

  describe('update', () => {
    const updateDto: UpdateExpenseDto = { description: 'Updated Controller Expense' };
    it('should call expensesService.update and return the result', async () => {
      const updatedExpense = { ...mockExpense, ...updateDto };
      mockExpensesService.update.mockResolvedValue(updatedExpense as any);
      const result = await controller.update(mockExpenseId, updateDto);
      expect(service.update).toHaveBeenCalledWith(mockExpenseId, updateDto);
      expect(result).toEqual(updatedExpense);
    });
  });

  describe('remove', () => {
    it('should call expensesService.remove', async () => {
      mockExpensesService.remove.mockResolvedValue(undefined); // remove returns void
      await controller.remove(mockExpenseId);
      expect(service.remove).toHaveBeenCalledWith(mockExpenseId);
    });
  });
}); 