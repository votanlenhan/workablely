import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpensesService } from './expenses.service';
import { Expense } from './entities/expense.entity';
import { User } from '../users/entities/user.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { IPaginationOptions, Pagination, IPaginationLinks, paginate as actualPaginate } from 'nestjs-typeorm-paginate';

// Mock nestjs-typeorm-paginate
jest.mock('nestjs-typeorm-paginate', () => ({
  ...jest.requireActual('nestjs-typeorm-paginate'), // Keep other exports like Pagination constructor
  paginate: jest.fn(), // Mock the paginate function itself
}));
const mockedPaginate = actualPaginate as jest.MockedFunction<typeof actualPaginate>;

// Mock user data
const mockUserId = 'user-uuid-123';
const mockUser = {
  id: mockUserId,
  first_name: 'Test',
  last_name: 'User',
  email: 'test@example.com',
  created_at: new Date(),
  updated_at: new Date(),
} as User;

// Mock expense data
const mockExpenseId = 'expense-uuid-456';
const mockExpenseDate = new Date('2024-07-28T00:00:00.000Z');
const mockExpense: Expense = {
  id: mockExpenseId,
  description: 'Test Expense',
  amount: 100.50,
  expense_date: mockExpenseDate,
  category: 'Test Category',
  is_wishlist_expense: false,
  recorded_by_user_id: mockUserId,
  recorded_by_user: mockUser,
  created_at: new Date('2024-07-28T10:00:00.000Z'),
  updated_at: new Date('2024-07-28T10:00:00.000Z'),
  payment_method: 'Cash',
  vendor: 'Local Store',
  receipt_url: 'http://example.com/receipt.png',
  notes: 'Initial test expense notes'
};

describe('ExpensesService', () => {
  let service: ExpensesService;
  let expenseRepository: Repository<Expense>;
  let userRepository: Repository<User>;

  // Define more robust mocks
  const mockExpenseRepositoryMethods = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    merge: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepositoryMethods = {
    findOneBy: jest.fn(),
  };

  // Mock QueryBuilder
  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    // Add other methods if paginate needs them internally, though paginate itself is mocked
  };

  beforeEach(async () => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockedPaginate.mockClear(); // Clear the specific mock for paginate

    mockExpenseRepositoryMethods.createQueryBuilder.mockReturnValue(mockQueryBuilder); // Ensure QB mock is fresh

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: getRepositoryToken(Expense),
          useValue: mockExpenseRepositoryMethods,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepositoryMethods,
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    expenseRepository = module.get<Repository<Expense>>(getRepositoryToken(Expense));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateExpenseDto = {
      description: 'New Live Expense',
      amount: 250.75,
      expense_date: '2024-08-01',
      category: 'Live Music',
      is_wishlist_expense: true,
      payment_method: 'Online',
      vendor: 'TicketMaster',
      receipt_url: 'http://receipts.com/live.jpg',
      notes: 'Concert tickets'
    };
    const expectedDate = new Date(createDto.expense_date);

    it('should create and return an expense', async () => {
      const createdEntity = {
        ...createDto,
        expense_date: expectedDate,
        recorded_by_user_id: mockUserId,
        id: 'new-generated-uuid',
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockUserRepositoryMethods.findOneBy.mockResolvedValue(mockUser);
      mockExpenseRepositoryMethods.create.mockReturnValue(createdEntity as any); // Type assertion if necessary
      mockExpenseRepositoryMethods.save.mockResolvedValue(createdEntity as any);

      const result = await service.create(createDto, mockUserId);

      expect(mockUserRepositoryMethods.findOneBy).toHaveBeenCalledWith({ id: mockUserId });
      expect(mockExpenseRepositoryMethods.create).toHaveBeenCalledWith({
        ...createDto,
        expense_date: expectedDate,
        recorded_by_user_id: mockUserId,
      });
      expect(mockExpenseRepositoryMethods.save).toHaveBeenCalledWith(createdEntity);
      expect(result).toEqual(createdEntity);
    });

    it('should log a warning if user not found but still create expense', async () => {
      mockUserRepositoryMethods.findOneBy.mockResolvedValue(null);
      const loggerSpy = jest.spyOn(service['logger'], 'warn');
      const createdEntity = {
        ...createDto,
        expense_date: expectedDate,
        recorded_by_user_id: 'unknown-user-id',
        id: 'new-generated-uuid-unknown-user',
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockExpenseRepositoryMethods.create.mockReturnValue(createdEntity as any);
      mockExpenseRepositoryMethods.save.mockResolvedValue(createdEntity as any);

      await service.create(createDto, 'unknown-user-id');
      expect(loggerSpy).toHaveBeenCalledWith('User not found for ID: unknown-user-id during expense creation.');
      expect(mockExpenseRepositoryMethods.save).toHaveBeenCalledWith(createdEntity);
    });

    it('should throw InternalServerErrorException if save fails', async () => {
      mockUserRepositoryMethods.findOneBy.mockResolvedValue(mockUser);
      mockExpenseRepositoryMethods.create.mockReturnValue({ ...createDto, expense_date: expectedDate } as any);
      mockExpenseRepositoryMethods.save.mockRejectedValue(new Error('DB save error'));
      await expect(service.create(createDto, mockUserId)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    const paginationOptions: IPaginationOptions = { page: 1, limit: 10, route: '/api/expenses' };
    const mockLinks: IPaginationLinks = { first: '', previous: '', next: '', last: '' }; // Simple mock for links
    const paginatedExpenses = new Pagination([mockExpense], { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 }, mockLinks);

    it('should return a paginated list of expenses', async () => {
      mockedPaginate.mockResolvedValue(paginatedExpenses as any); // Ensure the mock is used
      const result = await service.findAll(paginationOptions, {});
      expect(mockExpenseRepositoryMethods.createQueryBuilder).toHaveBeenCalledWith('expense');
      expect(mockedPaginate).toHaveBeenCalledWith(mockQueryBuilder, paginationOptions);
      expect(result).toEqual(paginatedExpenses);
    });

    it('should apply recorded_by_user_id filter', async () => {
      mockedPaginate.mockResolvedValue(paginatedExpenses as any);
      await service.findAll(paginationOptions, { recorded_by_user_id: mockUserId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'expense.recorded_by_user_id = :userId',
        { userId: mockUserId },
      );
    });

    it('should apply category filter', async () => {
      mockedPaginate.mockResolvedValue(paginatedExpenses as any);
      await service.findAll(paginationOptions, { category: 'Food' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'expense.category = :category',
        { category: 'Food' },
      );
    });
    
    it('should apply is_wishlist_expense filter', async () => {
      mockedPaginate.mockResolvedValue(paginatedExpenses as any);
      await service.findAll(paginationOptions, { is_wishlist_expense: true });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'expense.is_wishlist_expense = :isWishlist',
        { isWishlist: true },
      );
    });

    it('should apply year and month filter', async () => {
      mockedPaginate.mockResolvedValue(paginatedExpenses as any);
      await service.findAll(paginationOptions, { year: 2024, month: 7 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('EXTRACT(YEAR FROM expense.expense_date) = :year', { year: 2024 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('EXTRACT(MONTH FROM expense.expense_date) = :month', { month: 7 });
    });
     it('should apply year filter only', async () => {
      mockedPaginate.mockResolvedValue(paginatedExpenses as any);
      await service.findAll(paginationOptions, { year: 2023 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('EXTRACT(YEAR FROM expense.expense_date) = :year', { year: 2023 });
    });
  });

  describe('findOne', () => {
    it('should return an expense if found', async () => {
      mockExpenseRepositoryMethods.findOne.mockResolvedValue(mockExpense);
      const result = await service.findOne(mockExpenseId);
      expect(mockExpenseRepositoryMethods.findOne).toHaveBeenCalledWith({ where: { id: mockExpenseId }, relations: ['recorded_by_user'] });
      expect(result).toEqual(mockExpense);
    });

    it('should throw NotFoundException if expense not found', async () => {
      mockExpenseRepositoryMethods.findOne.mockResolvedValue(null);
      await expect(service.findOne('unknown-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateExpenseDto = { description: 'Updated Expense Description' };
    const existingExpense = { ...mockExpense, id: mockExpenseId }; // Clone to avoid mutation if mockExpense is used elsewhere

    it('should update and return the expense', async () => {
      const mergedExpense = { ...existingExpense, ...updateDto, updated_at: new Date() }; 
      // findOne is called internally by service.update
      mockExpenseRepositoryMethods.findOne.mockResolvedValue(existingExpense);
      mockExpenseRepositoryMethods.merge.mockImplementation((entity, dto) => Object.assign(entity, dto));
      mockExpenseRepositoryMethods.save.mockResolvedValue(mergedExpense as any);

      const result = await service.update(mockExpenseId, updateDto);

      expect(mockExpenseRepositoryMethods.findOne).toHaveBeenCalledWith({ where: {id: mockExpenseId }, relations: ['recorded_by_user']});
      expect(mockExpenseRepositoryMethods.merge).toHaveBeenCalledWith(existingExpense, expect.objectContaining(updateDto));
      expect(mockExpenseRepositoryMethods.save).toHaveBeenCalledWith(existingExpense); // `merge` modifies `existingExpense` in place
      expect(result.description).toBe(updateDto.description);
      expect(result.id).toBe(mockExpenseId);
    });

    it('should convert expense_date string to Date on update', async () => {
      const dateUpdateDto: UpdateExpenseDto = { expense_date: '2024-09-15' };
      const expectedDate = new Date(dateUpdateDto.expense_date as string);
      const mergedExpenseWithDate = { ...existingExpense, expense_date: expectedDate, updated_at: new Date() }; 

      mockExpenseRepositoryMethods.findOne.mockResolvedValue(existingExpense);
      mockExpenseRepositoryMethods.merge.mockImplementation((entity, dto) => Object.assign(entity, dto));
      mockExpenseRepositoryMethods.save.mockResolvedValue(mergedExpenseWithDate as any);

      const result = await service.update(mockExpenseId, dateUpdateDto);
      expect(mockExpenseRepositoryMethods.merge).toHaveBeenCalledWith(existingExpense, expect.objectContaining({ expense_date: expectedDate }));
      expect(result.expense_date).toEqual(expectedDate);
    });

    it('should throw NotFoundException if expense to update is not found by findOne', async () => {
      mockExpenseRepositoryMethods.findOne.mockResolvedValue(null);
      await expect(service.update('unknown-id', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if save fails during update', async () => {
      mockExpenseRepositoryMethods.findOne.mockResolvedValue(existingExpense);
      mockExpenseRepositoryMethods.merge.mockImplementation((entity, dto) => Object.assign(entity, dto));
      mockExpenseRepositoryMethods.save.mockRejectedValue(new Error('DB save error'));
      await expect(service.update(mockExpenseId, updateDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('remove', () => {
    it('should remove the expense', async () => {
      mockExpenseRepositoryMethods.findOne.mockResolvedValue(mockExpense); // findOne is called by remove
      mockExpenseRepositoryMethods.delete.mockResolvedValue({ affected: 1, raw: {} });
      await service.remove(mockExpenseId);
      expect(mockExpenseRepositoryMethods.findOne).toHaveBeenCalledWith({ where: {id: mockExpenseId }, relations: ['recorded_by_user']});
      expect(mockExpenseRepositoryMethods.delete).toHaveBeenCalledWith(mockExpenseId);
    });

    it('should throw NotFoundException if expense to remove is not found by findOne', async () => {
      mockExpenseRepositoryMethods.findOne.mockResolvedValue(null);
      await expect(service.remove('unknown-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if delete operation affects 0 rows', async () => {
      mockExpenseRepositoryMethods.findOne.mockResolvedValue(mockExpense);
      mockExpenseRepositoryMethods.delete.mockResolvedValue({ affected: 0, raw: {} });
      await expect(service.remove(mockExpenseId)).rejects.toThrow(NotFoundException);
    });
  });
}); 