import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExternalIncomesService } from './external-incomes.service';
import { ExternalIncome } from './entities/external-income.entity';
import { User } from '../users/entities/user.entity';
import { CreateExternalIncomeDto } from './dto/create-external-income.dto';
import { UpdateExternalIncomeDto } from './dto/update-external-income.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { IPaginationOptions, Pagination, paginate as actualPaginate, IPaginationMeta, IPaginationLinks } from 'nestjs-typeorm-paginate';

// Mock nestjs-typeorm-paginate
jest.mock('nestjs-typeorm-paginate', () => ({
  ...jest.requireActual('nestjs-typeorm-paginate'),
  paginate: jest.fn(),
}));
const mockPaginate = actualPaginate as jest.MockedFunction<typeof actualPaginate>; // Use this for type safety if needed, or just jest.fn()

// Mock user data
const mockUserId = 'user-uuid-for-ei';
const mockUser = {
  id: mockUserId,
  first_name: 'Income',
  last_name: 'Recorder',
  email: 'income.recorder@example.com',
} as User;

// Mock external income data
const mockIncomeId = 'ei-uuid-123';
const mockIncomeDate = new Date('2024-01-15T00:00:00.000Z');
const mockExternalIncome: ExternalIncome = {
  id: mockIncomeId,
  description: 'Consulting Fee',
  amount: 1200.50,
  income_date: mockIncomeDate,
  source: 'Client Corp',
  notes: 'Q1 Consulting work',
  recorded_by_user_id: mockUserId,
  recorded_by_user: mockUser,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockExternalIncomeRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    // getMany: jest.fn(), // For non-paginated or if paginate mock fails
    // getOne: jest.fn(), // For non-paginated or if paginate mock fails
  })),
};

describe('ExternalIncomesService', () => {
  let service: ExternalIncomesService;
  let repository: Repository<ExternalIncome>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalIncomesService,
        {
          provide: getRepositoryToken(ExternalIncome),
          useValue: mockExternalIncomeRepository,
        },
      ],
    }).compile();

    service = module.get<ExternalIncomesService>(ExternalIncomesService);
    repository = module.get<Repository<ExternalIncome>>(getRepositoryToken(ExternalIncome));

    // Reset mocks before each test
    jest.clearAllMocks();
    (actualPaginate as jest.Mock).mockClear(); 
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return an external income', async () => {
      const createDto: CreateExternalIncomeDto = {
        description: 'New Project Advance',
        amount: 2500.00,
        income_date: '2024-02-20',
        source: 'New Client Inc.',
        notes: 'Initial payment for project X',
      };
      const expectedIncome = {
        ...mockExternalIncome,
        ...createDto,
        income_date: new Date(createDto.income_date),
        recorded_by_user_id: mockUserId,
      };

      mockExternalIncomeRepository.create.mockReturnValue(expectedIncome as any); // TypeORM create might return partial
      mockExternalIncomeRepository.save.mockResolvedValue(expectedIncome as any);

      const result = await service.create(createDto, mockUserId);
      expect(result).toEqual(expectedIncome);
      expect(mockExternalIncomeRepository.create).toHaveBeenCalledWith({
        ...createDto,
        income_date: new Date(createDto.income_date),
        recorded_by_user_id: mockUserId,
      });
      expect(mockExternalIncomeRepository.save).toHaveBeenCalledWith(expectedIncome);
    });

    it('should throw InternalServerErrorException on repository.save failure', async () => {
      const createDto: CreateExternalIncomeDto = { description: 'Fail Save', amount: 100, income_date: '2024-03-01' };
      mockExternalIncomeRepository.create.mockReturnValue({ ...createDto, income_date: new Date(createDto.income_date) } as any);
      mockExternalIncomeRepository.save.mockRejectedValue(new Error('DB Save Error'));
      await expect(service.create(createDto, mockUserId)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    const paginationOptions: IPaginationOptions = { page: 1, limit: 10, route: 'external-incomes' };
    const mockPaginationMeta: IPaginationMeta = { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 };
    const mockPaginationLinks: IPaginationLinks = { first: '', previous: '', next: '', last: '' };

    it('should return paginated external incomes', async () => {
      const paginatedResult: Pagination<ExternalIncome> = new Pagination(
        [mockExternalIncome],
        mockPaginationMeta,
        mockPaginationLinks,
      );
      (actualPaginate as jest.Mock).mockResolvedValue(paginatedResult);
      mockExternalIncomeRepository.createQueryBuilder.mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        // getMany: jest.fn().mockResolvedValue([mockExternalIncome]) // fallback if needed
      } as any);

      const result = await service.findAll(paginationOptions);
      expect(result).toEqual(paginatedResult);
      expect(mockExternalIncomeRepository.createQueryBuilder).toHaveBeenCalled();
      expect(actualPaginate).toHaveBeenCalled();
    });

    it('should apply recordedByUserId filter if provided', async () => {
      const queryBuilderMock = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
      };
      mockExternalIncomeRepository.createQueryBuilder.mockReturnValue(queryBuilderMock as any);
      (actualPaginate as jest.Mock).mockResolvedValue(new Pagination([], mockPaginationMeta, mockPaginationLinks));

      await service.findAll(paginationOptions, mockUserId);
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'income.recorded_by_user_id = :recordedByUserId',
        { recordedByUserId: mockUserId },
      );
    });

    it('should apply year and month filters if provided', async () => {
        const queryBuilderMock = {
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
          };
        mockExternalIncomeRepository.createQueryBuilder.mockReturnValue(queryBuilderMock as any);
        (actualPaginate as jest.Mock).mockResolvedValue(new Pagination([], mockPaginationMeta, mockPaginationLinks));
  
        await service.findAll(paginationOptions, undefined, 2024, 7);
        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
            'EXTRACT(YEAR FROM income.income_date) = :year',
            { year: 2024 },
        );
        expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
            'EXTRACT(MONTH FROM income.income_date) = :month',
            { month: 7 },
        );
      });

    it('should throw InternalServerErrorException on paginate failure', async () => {
      // Ensure queryBuilder methods are available, but paginate itself fails
      mockExternalIncomeRepository.createQueryBuilder.mockReturnValueOnce({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
      } as any);
      (actualPaginate as jest.Mock).mockRejectedValue(new Error('Paginate Error'));
      await expect(service.findAll(paginationOptions)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should return an external income if found', async () => {
      mockExternalIncomeRepository.findOne.mockResolvedValue(mockExternalIncome);
      const result = await service.findOne(mockIncomeId);
      expect(result).toEqual(mockExternalIncome);
      expect(mockExternalIncomeRepository.findOne).toHaveBeenCalledWith({ where: { id: mockIncomeId }, relations: ['recorded_by_user'] });
    });

    it('should throw NotFoundException if external income is not found', async () => {
      mockExternalIncomeRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the external income', async () => {
      const updateDto: UpdateExternalIncomeDto = { description: 'Updated Description', amount: 1500 };
      const updatedIncome = { ...mockExternalIncome, ...updateDto };

      // Mock findOne for initial check and for returning updated record
      mockExternalIncomeRepository.findOne.mockResolvedValueOnce(mockExternalIncome); // For initial fetch in update
      mockExternalIncomeRepository.findOne.mockResolvedValueOnce(updatedIncome);    // For fetching after update
      mockExternalIncomeRepository.update.mockResolvedValue({ affected: 1 } as any); // TypeORM update result

      const result = await service.update(mockIncomeId, updateDto);
      expect(result).toEqual(updatedIncome);
      expect(mockExternalIncomeRepository.update).toHaveBeenCalledWith(mockIncomeId, updateDto);
      expect(mockExternalIncomeRepository.findOne).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException if external income to update is not found', async () => {
      mockExternalIncomeRepository.findOne.mockResolvedValue(null); // findOne in update method fails
      const updateDto: UpdateExternalIncomeDto = { description: 'Won\'t Update' };
      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on repository.update failure', async () => {
        mockExternalIncomeRepository.findOne.mockResolvedValue(mockExternalIncome);
        mockExternalIncomeRepository.update.mockRejectedValue(new Error('DB Update Error'));
        const updateDto: UpdateExternalIncomeDto = { description: 'Fail Update' };
        await expect(service.update(mockIncomeId, updateDto)).rejects.toThrow(InternalServerErrorException);
      });
  });

  describe('remove', () => {
    it('should successfully remove an external income', async () => {
      mockExternalIncomeRepository.delete.mockResolvedValue({ affected: 1, raw: [] });
      await expect(service.remove(mockIncomeId)).resolves.toBeUndefined();
      expect(mockExternalIncomeRepository.delete).toHaveBeenCalledWith(mockIncomeId);
    });

    it('should throw NotFoundException if external income to remove is not found', async () => {
      mockExternalIncomeRepository.delete.mockResolvedValue({ affected: 0, raw: [] });
      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
}); 