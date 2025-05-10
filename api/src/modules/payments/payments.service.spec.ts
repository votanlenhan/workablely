import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { ShowsService } from '@/modules/shows/shows.service';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

// Mock nestjs-typeorm-paginate
jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));
const { paginate: mockPaginate } = require('nestjs-typeorm-paginate');

// Mock TypeORM QueryRunner methods
const mockPaymentRepoInQR = {
    findOne: jest.fn(),
    // Add other Payment repository methods if used via queryRunner.manager.getRepository(Payment).<method>
};
const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    save: jest.fn(),
    delete: jest.fn(),
    getRepository: jest.fn().mockImplementation((entity) => {
        if (entity === Payment) {
            return mockPaymentRepoInQR;
        }
        return { findOne: jest.fn(), save: jest.fn() }; // Default mock for other entities
    }),
  },
} as unknown as QueryRunner;

// Mock DataSource
const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
};

// Mock ShowsService
const mockShowsService = {
  updateShowFinancesAfterPayment: jest.fn(),
  // Add other methods if PaymentsService calls them
};

// Mock PaymentRepository
const mockPaymentRepository = {
  create: jest.fn(),
  save: jest.fn(), // For operations outside a transaction if any, though service uses queryRunner.manager.save
  findOne: jest.fn(),
  delete: jest.fn(), // For operations outside a transaction if any
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    // Add other QueryBuilder methods if used by findAll
  }),
};

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentRepository: Repository<Payment>;
  let showsService: ShowsService;
  let dataSource: DataSource;

  beforeEach(async () => {
    jest.clearAllMocks();
    (mockPaginate as jest.Mock).mockClear();
    
    // Reset specific query runner mocks that might carry state
    (mockQueryRunner.connect as jest.Mock).mockClear();
    (mockQueryRunner.startTransaction as jest.Mock).mockClear();
    (mockQueryRunner.commitTransaction as jest.Mock).mockClear();
    (mockQueryRunner.rollbackTransaction as jest.Mock).mockClear();
    (mockQueryRunner.release as jest.Mock).mockClear();
    (mockQueryRunner.manager.save as jest.Mock).mockClear();
    (mockQueryRunner.manager.delete as jest.Mock).mockClear();
    (mockQueryRunner.manager.getRepository as jest.Mock).mockClear().mockImplementation((entity) => {
        if (entity === Payment) {
            (mockPaymentRepoInQR.findOne as jest.Mock).mockClear();
            return mockPaymentRepoInQR;
        }
        const defaultMockRepo = { findOne: jest.fn(), save: jest.fn() };
        (defaultMockRepo.findOne as jest.Mock).mockClear();
        (defaultMockRepo.save as jest.Mock).mockClear();
        return defaultMockRepo;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useValue: mockPaymentRepository },
        { provide: ShowsService, useValue: mockShowsService },
        { provide: DataSource, useValue: mockDataSource }, // mockDataSource provides mockQueryRunner
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    paymentRepository = module.get<Repository<Payment>>(getRepositoryToken(Payment));
    showsService = module.get<ShowsService>(ShowsService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const rawPaymentDate = new Date().toISOString();
    const createDto: CreatePaymentDto = {
      show_id: 'show-uuid-1',
      amount: 100,
      payment_date: rawPaymentDate,
      is_deposit: false,
    };
    const creatorUserId = 'user-uuid-1';
    const expectedPaymentObjectForCreate = {
        ...createDto,
        payment_date: new Date(rawPaymentDate),
        recorded_by_user_id: creatorUserId,
    };
    const savedPaymentMock = { 
        ...expectedPaymentObjectForCreate, 
        id: 'payment-uuid-1', 
    };

    it('should create a payment, update show finances, and return the payment', async () => {
      mockPaymentRepository.create.mockReturnValue(expectedPaymentObjectForCreate as any);
      (mockQueryRunner.manager.save as jest.Mock).mockResolvedValue(savedPaymentMock as any); // This is the payment being saved
      
      jest.spyOn(service, 'findOne').mockResolvedValue(savedPaymentMock as Payment);
      (mockShowsService.updateShowFinancesAfterPayment as jest.Mock).mockResolvedValue(undefined);

      const result = await service.create(createDto, creatorUserId);

      expect(dataSource.createQueryRunner).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(mockPaymentRepository.create).toHaveBeenCalledWith(expectedPaymentObjectForCreate);
      expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(Payment, expectedPaymentObjectForCreate);
      expect(showsService.updateShowFinancesAfterPayment).toHaveBeenCalledWith(createDto.show_id, mockQueryRunner);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(savedPaymentMock.id); // Verify the internal findOne call
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
      expect(result).toEqual(savedPaymentMock);
    });

    it('should rollback and throw if findOne after save fails in create', async () => {
      mockPaymentRepository.create.mockReturnValue(expectedPaymentObjectForCreate as any);
      (mockQueryRunner.manager.save as jest.Mock).mockResolvedValue(savedPaymentMock as any);
      (mockShowsService.updateShowFinancesAfterPayment as jest.Mock).mockResolvedValue(undefined); // Assume this succeeds
      
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Post-save findOne failed'));

      await expect(service.create(createDto, creatorUserId)).rejects.toThrow(InternalServerErrorException);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(1);
      expect(showsService.updateShowFinancesAfterPayment).toHaveBeenCalledTimes(1); 
      expect(service.findOne).toHaveBeenCalledWith(savedPaymentMock.id);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1); // Transaction might commit before findOne fails
      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled(); // Rollback is in catch block after findOne failure point
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('should rollback transaction and re-throw error if show finance update fails', async () => {
      mockPaymentRepository.create.mockReturnValue(expectedPaymentObjectForCreate as any);
      (mockQueryRunner.manager.save as jest.Mock).mockResolvedValue(savedPaymentMock as any);
      const dbError = new Error('DB error on show update');
      (mockShowsService.updateShowFinancesAfterPayment as jest.Mock).mockRejectedValue(dbError);

      // No need to mock service.findOne here as it won't be reached if updateShowFinances fails

      await expect(service.create(createDto, creatorUserId)).rejects.toThrow(InternalServerErrorException);
      
      expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.manager.save).toHaveBeenCalledTimes(1);
      expect(showsService.updateShowFinancesAfterPayment).toHaveBeenCalledWith(createDto.show_id, mockQueryRunner);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('should rollback transaction and re-throw NotFoundException if show is not found during finance update', async () => {
      mockPaymentRepository.create.mockReturnValue(expectedPaymentObjectForCreate as any);
      (mockQueryRunner.manager.save as jest.Mock).mockResolvedValue(savedPaymentMock as any);
      (mockShowsService.updateShowFinancesAfterPayment as jest.Mock).mockRejectedValue(new NotFoundException('Show not found'));

      await expect(service.create(createDto, creatorUserId)).rejects.toThrow(NotFoundException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('should rollback transaction if saving payment fails', async () => {
      mockPaymentRepository.create.mockReturnValue(expectedPaymentObjectForCreate as any);
      const saveError = new Error('Failed to save payment');
      (mockQueryRunner.manager.save as jest.Mock).mockRejectedValue(saveError);

      await expect(service.create(createDto, creatorUserId)).rejects.toThrow(InternalServerErrorException);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(Payment, expectedPaymentObjectForCreate);
      expect(showsService.updateShowFinancesAfterPayment).not.toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });
  });

  // --- Test Cases for findAll() ---
  describe('findAll', () => {
    it('should return a paginated list of payments', async () => {
      const options: IPaginationOptions = { page: 1, limit: 10, route: '/payments' };
      const paymentData = { id: 'p1', amount: 50, show_id: 's1' };
      const paginatedResult: Pagination<Payment> = {
        items: [paymentData as any],
        meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
        links: { first: '', previous: '', next: '', last: '' },
      };
      mockPaginate.mockResolvedValue(paginatedResult);

      const result = await service.findAll(options);

      expect(mockPaymentRepository.createQueryBuilder).toHaveBeenCalledWith('payment');
      expect(mockPaymentRepository.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledWith('payment.show', 'show');
      expect(mockPaymentRepository.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalledWith('payment.recorded_by_user', 'recordedBy');
      expect(mockPaymentRepository.createQueryBuilder().orderBy).toHaveBeenCalledWith('payment.payment_date', 'DESC');
      expect(mockPaginate).toHaveBeenCalledWith(mockPaymentRepository.createQueryBuilder(), options);
      expect(result).toEqual(paginatedResult);
    });
  });

  // --- Test Cases for findOne() ---
  describe('findOne', () => {
    const paymentId = 'payment-uuid-1';
    const paymentData = { id: paymentId, amount: 100, show_id: 's1' };

    it('should return a payment if found', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(paymentData as any);
      const result = await service.findOne(paymentId);
      expect(mockPaymentRepository.findOne).toHaveBeenCalledWith({ where: { id: paymentId }, relations: ['show', 'recorded_by_user'] });
      expect(result).toEqual(paymentData);
    });

    it('should throw NotFoundException if payment not found', async () => {
      mockPaymentRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(paymentId)).rejects.toThrow(NotFoundException);
    });

    it('should use queryRunner manager if provided', async () => {
        mockPaymentRepoInQR.findOne.mockResolvedValue(paymentData as any);
        const result = await service.findOne(paymentId, mockQueryRunner as unknown as QueryRunner);
        expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(Payment);
        expect(mockPaymentRepoInQR.findOne).toHaveBeenCalledWith({ where: { id: paymentId }, relations: ['show', 'recorded_by_user'] });
        expect(mockPaymentRepository.findOne).not.toHaveBeenCalled(); // Ensure default repo is not called
        expect(result).toEqual(paymentData);
    });
  });

  // --- Test Cases for update() ---
  describe('update', () => {
    const paymentId = 'payment-uuid-x';
    const updateDto: UpdatePaymentDto = { amount: 150, notes: 'Updated notes' };
    const existingPayment = { id: paymentId, amount: 100, show_id: 'show-abc', payment_date: new Date(), created_at: new Date(), updated_at: new Date(), recorded_by_user_id: 'user-recorder-id' } as Payment;
    const updatedPaymentDataFromSave = { ...existingPayment, ...updateDto }; // What save would return
    const finalFetchedPayment = { ...updatedPaymentDataFromSave }; // What the final findOne would return

    beforeEach(() => {
        // Mock for the findOne *inside* the transaction (via queryRunner)
        (mockPaymentRepoInQR.findOne as jest.Mock).mockResolvedValue(existingPayment);
        
        // Mock for the save *inside* the transaction
        (mockQueryRunner.manager.save as jest.Mock).mockResolvedValue(updatedPaymentDataFromSave); 
        
        // Mock for the findOne *after* the transaction to return the final state
        mockPaymentRepository.findOne.mockResolvedValue(finalFetchedPayment);
        
        (mockShowsService.updateShowFinancesAfterPayment as jest.Mock).mockResolvedValue(undefined);
    });

    it('should update a payment, update show finances, and return the updated payment', async () => {
      const result = await service.update(paymentId, updateDto);

      expect(dataSource.createQueryRunner).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.connect).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
      
      // Check that findOne using queryRunner was called to fetch existing payment
      expect(mockQueryRunner.manager.getRepository).toHaveBeenCalledWith(Payment);
      expect(mockPaymentRepoInQR.findOne).toHaveBeenCalledTimes(1); 
      expect(mockPaymentRepoInQR.findOne).toHaveBeenCalledWith({ where: { id: paymentId }, relations: ['show', 'recorded_by_user'] });
      
      // Check that save using queryRunner was called
      expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(Payment, expect.objectContaining(updateDto));
      
      expect(showsService.updateShowFinancesAfterPayment).toHaveBeenCalledWith(existingPayment.show_id, mockQueryRunner);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      
      // Check that the final findOne (outside transaction, on main repo) was called
      expect(mockPaymentRepository.findOne).toHaveBeenCalledWith({ where: { id: paymentId }, relations: ['show', 'recorded_by_user'] });

      expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
      expect(result).toEqual(finalFetchedPayment);
    });

    // Add other update failure scenarios (e.g. findOne fails, save fails, show finance update fails)
  });

  // --- Test Cases for remove() ---
  describe('remove', () => {
    const paymentId = 'payment-to-delete';
    const mockPayment = { id: paymentId, show_id: 's1', amount: 50 } as Payment;

    beforeEach(() => {
        (mockPaymentRepoInQR.findOne as jest.Mock).mockResolvedValue(mockPayment); // Corrected mock setup
        (mockQueryRunner.manager.delete as jest.Mock).mockResolvedValue({ affected: 1, raw: [] });
        (mockShowsService.updateShowFinancesAfterPayment as jest.Mock).mockResolvedValue(undefined);
    });

    it('should remove a payment and update show finances', async () => {
      await service.remove(paymentId);

      expect(dataSource.createQueryRunner).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.startTransaction).toHaveBeenCalledTimes(1);
      expect(mockPaymentRepoInQR.findOne).toHaveBeenCalledWith({ where: { id: paymentId }, relations: ['show', 'recorded_by_user'] }); // Corrected assertion
      expect(mockQueryRunner.manager.delete).toHaveBeenCalledWith(Payment, paymentId);
      expect(showsService.updateShowFinancesAfterPayment).toHaveBeenCalledWith(mockPayment.show_id, mockQueryRunner);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(1);
      expect(mockQueryRunner.release).toHaveBeenCalledTimes(1);
    });
    
    // Add other remove failure scenarios
  });
}); 