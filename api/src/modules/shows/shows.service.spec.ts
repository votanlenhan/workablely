import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { ShowsService } from './shows.service';
import { Show, ShowStatus, ShowPaymentStatus } from './entities/show.entity';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { ClientsService } from '../clients/clients.service';
import { Client } from '../clients/entities/client.entity';
import { User } from '../users/entities/user.entity';
import { Payment } from '../payments/entities/payment.entity';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import { RevenueAllocationsService } from '../revenue-allocations/revenue-allocations.service';
import { DataSource } from 'typeorm';

// Mock the entire module
jest.mock('nestjs-typeorm-paginate', () => ({
    ...jest.requireActual('nestjs-typeorm-paginate'), // Keep other exports if any
    paginate: jest.fn(),
}));

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue({
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      getRepository: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    },
  }),
};

// --- Mocks --- //
const mockShowRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  getOne: jest.fn(), // for findOneWithRelations if used by service
  getMany: jest.fn(), // for findAllWithRelations if used by service
};

const mockClientsService = {
  findOne: jest.fn(),
};

const MOCK_CLIENT_ID = 'client-for-show-mock';
const MOCK_USER_ID = 'user-for-show-mock';

const createFullMockShow = (id: string, title: string, partialShow?: Partial<Show>): Show => {
  const now = new Date();
  const baseShow = {
    id,
    title: title,
    clientId: MOCK_CLIENT_ID,
    client: { id: MOCK_CLIENT_ID, name: 'Mock Client' } as Client,
    show_type: 'MockType',
    start_datetime: now,
    end_datetime: null,
    location_address: null,
    location_details: null,
    requirements: null,
    status: ShowStatus.PENDING,
    total_price: 1000,
    deposit_amount: 0,
    deposit_date: null,
    total_collected: 0,
    amount_due: 1000,
    payment_status: ShowPaymentStatus.UNPAID,
    post_processing_deadline: null,
    delivered_at: null,
    completed_at: null,
    cancelled_at: null,
    cancellation_reason: null,
    createdByUserId: MOCK_USER_ID,
    createdBy: { id: MOCK_USER_ID, email: 'user@mock.com' } as User,
    createdAt: now,
    updatedAt: now,
    assignments: [],
    payments: [],
    equipmentAssignments: [],
  };

  const merged = { ...baseShow, ...partialShow };

  // Ensure date types after merge, especially for partialShow overrides
  merged.start_datetime = merged.start_datetime instanceof Date ? merged.start_datetime : (typeof merged.start_datetime === 'string' ? new Date(merged.start_datetime) : now);
  merged.end_datetime = merged.end_datetime instanceof Date ? merged.end_datetime : (typeof merged.end_datetime === 'string' ? new Date(merged.end_datetime) : null);
  merged.deposit_date = merged.deposit_date instanceof Date ? merged.deposit_date : (typeof merged.deposit_date === 'string' ? new Date(merged.deposit_date) : null);
  merged.post_processing_deadline = merged.post_processing_deadline instanceof Date ? merged.post_processing_deadline : (typeof merged.post_processing_deadline === 'string' ? new Date(merged.post_processing_deadline) : null);
  merged.delivered_at = merged.delivered_at instanceof Date ? merged.delivered_at : (typeof merged.delivered_at === 'string' ? new Date(merged.delivered_at) : null);
  merged.completed_at = merged.completed_at instanceof Date ? merged.completed_at : (typeof merged.completed_at === 'string' ? new Date(merged.completed_at) : null);
  merged.cancelled_at = merged.cancelled_at instanceof Date ? merged.cancelled_at : (typeof merged.cancelled_at === 'string' ? new Date(merged.cancelled_at) : null);
  merged.createdAt = merged.createdAt instanceof Date ? merged.createdAt : now;
  merged.updatedAt = merged.updatedAt instanceof Date ? merged.updatedAt : now;
  
  return merged as Show;
};

// Mock QueryRunner for updateShowFinancesAfterPayment
const mockFinanceQueryRunnerManagerRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
};
const mockFinanceQueryRunner = {
    manager: {
        getRepository: jest.fn().mockReturnValue(mockFinanceQueryRunnerManagerRepo),
        // findOne and save are now on the returned repo mock above
    },
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
} as unknown as QueryRunner;

describe('ShowsService', () => {
  let service: ShowsService;

  beforeEach(async () => {
    Object.values(mockShowRepository).forEach(mockFn => mockFn.mockClear());
    Object.values(mockQueryBuilder).forEach(mockFn => mockFn.mockClear());
    Object.values(mockClientsService).forEach(mockFn => mockFn.mockClear());
    mockShowRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);
    (paginate as jest.Mock).mockClear();
    (paginate as jest.Mock).mockResolvedValue({
        items: [],
        meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
        links: { first: '', previous: '', next: '', last: '' },
    });

    // Clear finance query runner mocks
    Object.values(mockFinanceQueryRunnerManagerRepo).forEach(mockFn => mockFn.mockClear());
    (mockFinanceQueryRunner.manager.getRepository as jest.Mock).mockClear().mockReturnValue(mockFinanceQueryRunnerManagerRepo);
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowsService,
        {
          provide: getRepositoryToken(Show),
          useValue: mockShowRepository,
        },
        {
          provide: ClientsService,
          useValue: mockClientsService,
        },
        { provide: RevenueAllocationsService, useValue: { calculateAndSaveAllocationsForShow: jest.fn() } },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<ShowsService>(ShowsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const testDate = new Date();
    const createDto: CreateShowDto = {
        clientId: MOCK_CLIENT_ID,
        show_type: 'Wedding',
        start_datetime: testDate.toISOString(),
        total_price: 1000,
        deposit_amount: 200,
        deposit_date: '2024-01-01',
    };
    const creatorUserId = MOCK_USER_ID;
    const mockClient = { id: MOCK_CLIENT_ID, name: 'Test Client' } as Client;

    it('should create and return a show', async () => {
      const expectedAmountDue = (createDto.total_price || 0) - (createDto.deposit_amount || 0);
      // Manually determine expected status based on logic in ShowsService.determinePaymentStatus
      let expectedPaymentStatus = ShowPaymentStatus.UNPAID;
      if ((createDto.deposit_amount || 0) > 0) {
        if ((createDto.deposit_amount || 0) < (createDto.total_price || 0)) {
            expectedPaymentStatus = ShowPaymentStatus.PARTIALLY_PAID;
        } else if ((createDto.deposit_amount || 0) >= (createDto.total_price || 0)) {
            expectedPaymentStatus = ShowPaymentStatus.PAID;
        }
      }

      const expectedCreatedObject = {
        clientId: createDto.clientId,
        show_type: createDto.show_type,
        start_datetime: new Date(createDto.start_datetime),
        total_price: createDto.total_price,
        deposit_amount: createDto.deposit_amount,
        deposit_date: new Date(createDto.deposit_date!),
        created_by_user_id: creatorUserId,
        total_collected: createDto.deposit_amount || 0,
        amount_due: expectedAmountDue,
        payment_status: expectedPaymentStatus,
        status: ShowStatus.PENDING,
      };
      const savedShow = createFullMockShow('show-uuid-1', 'Wedding Show', expectedCreatedObject);

      mockClientsService.findOne.mockResolvedValue(mockClient);
      mockShowRepository.create.mockImplementation((dto) => dto);
      mockShowRepository.save.mockResolvedValue(savedShow);

      const result = await service.create(createDto, creatorUserId);

      expect(mockClientsService.findOne).toHaveBeenCalledWith(createDto.clientId);
      expect(mockShowRepository.create).toHaveBeenCalledWith(expect.objectContaining(expectedCreatedObject));
      expect(mockShowRepository.save).toHaveBeenCalledWith(expect.objectContaining(expectedCreatedObject));
      expect(result).toEqual(savedShow);
    });

    it('should calculate initial state correctly with no deposit', async () => {
        const testDateNoDeposit = new Date();
        const createDtoNoDeposit: CreateShowDto = {
            clientId: MOCK_CLIENT_ID,
            show_type: 'Event',
            start_datetime: testDateNoDeposit.toISOString(),
            total_price: 1000,
        };
        const expectedAmountDue = (createDtoNoDeposit.total_price || 0) - 0;
        const expectedPaymentStatus = ShowPaymentStatus.UNPAID; 

        const expectedCreatedObjectNoDeposit = {
          clientId: createDtoNoDeposit.clientId,
          show_type: createDtoNoDeposit.show_type,
          start_datetime: new Date(createDtoNoDeposit.start_datetime),
          total_price: createDtoNoDeposit.total_price,
          created_by_user_id: creatorUserId,
          total_collected: 0,
          amount_due: expectedAmountDue,
          payment_status: expectedPaymentStatus,
          status: ShowStatus.PENDING,
        };
        const expectedSavedObjectNoDeposit = {
            ...expectedCreatedObjectNoDeposit,
            deposit_amount: null,
            deposit_date: null,
        };

        const savedShowNoDeposit = createFullMockShow('show-uuid-2', 'Event Show', expectedSavedObjectNoDeposit);
        
        mockClientsService.findOne.mockResolvedValue(mockClient);
        mockShowRepository.create.mockImplementation((dto) => dto);
        mockShowRepository.save.mockResolvedValue(savedShowNoDeposit);

        const result = await service.create(createDtoNoDeposit, creatorUserId);
        expect(mockShowRepository.create).toHaveBeenCalledWith(expect.objectContaining(expectedCreatedObjectNoDeposit));
        expect(mockShowRepository.save).toHaveBeenCalledWith(expect.objectContaining(expectedSavedObjectNoDeposit));
        expect(result).toEqual(savedShowNoDeposit);
    });

    it('should throw NotFoundException if client does not exist', async () => {
        mockClientsService.findOne.mockRejectedValue(new NotFoundException());
        await expect(service.create(createDto, creatorUserId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return a paginated list of shows', async () => {
      const options: IPaginationOptions = { page: 1, limit: 10, route: '/shows' };
      const showItem = createFullMockShow('show-1', 'Test Show');
      const paginatedResult = { items: [showItem], meta: { totalItems: 1, itemCount: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 } } as Pagination<Show>; 
      (paginate as jest.Mock).mockResolvedValue(paginatedResult);

      const result = await service.findAll(options);
      expect(paginate).toHaveBeenCalledWith(mockQueryBuilder, options);
      expect(mockShowRepository.createQueryBuilder).toHaveBeenCalledWith('show');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('show.client', 'client');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('show.createdBy', 'createdByUser');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('show.assignments', 'assignments');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('show.payments', 'payments');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('show.start_datetime', 'DESC');
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return a show if found', async () => {
      const showId = 'show-find-1';
      const expectedShow = createFullMockShow(showId, 'Found Show');
      mockShowRepository.findOne.mockResolvedValue(expectedShow);
      const result = await service.findOne(showId);
      expect(mockShowRepository.findOne).toHaveBeenCalledWith({
        where: { id: showId },
        relations: ['client', 'createdBy', 'assignments', 'payments'],
      });
      expect(result).toEqual(expectedShow);
    });

    it('should throw NotFoundException if show not found', async () => {
      mockShowRepository.findOne.mockResolvedValue(null); // Repository findOne returns null if not found
      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const showId = 'show-update-1';
    const updateDto: UpdateShowDto = { title: 'Updated Show Title' }; 

    it('should update allowed fields and re-evaluate payment_status based on existing financials', async () => {
      const existingShowWithFinances = createFullMockShow(showId, 'Original Title', {
        total_price: 1200, 
        total_collected: 300,
      });
      existingShowWithFinances.payment_status = service['determinePaymentStatus'](existingShowWithFinances.total_collected, existingShowWithFinances.total_price);

      jest.spyOn(service, 'findOne').mockResolvedValue(existingShowWithFinances);
      
      const expectedPreloadObject: Partial<Show> = { title: updateDto.title }; 
      if(updateDto.start_datetime) expectedPreloadObject.start_datetime = new Date(updateDto.start_datetime);
      
      const stateAfterPreload = { ...existingShowWithFinances, ...expectedPreloadObject }; 
      mockShowRepository.preload.mockResolvedValue(stateAfterPreload);
      
      mockShowRepository.save.mockImplementation(entity => Promise.resolve(entity as Show));

      const result = await service.update(showId, updateDto);

      expect(service.findOne).toHaveBeenCalledWith(showId);
      expect(mockShowRepository.preload).toHaveBeenCalledWith({ id: showId, ...expectedPreloadObject });
      
      expect(mockShowRepository.save).toHaveBeenCalledWith(stateAfterPreload);
      
      const expectedPaymentStatusAfterUpdate = service['determinePaymentStatus'](
        stateAfterPreload.total_price,
        stateAfterPreload.total_collected
      );

      expect(expectedPaymentStatusAfterUpdate).toEqual(ShowPaymentStatus.PARTIALLY_PAID);

      const expectedFinalShowState = {
        ...stateAfterPreload, 
        payment_status: ShowPaymentStatus.PARTIALLY_PAID
      };

      expect(mockShowRepository.save).toHaveBeenCalledWith(expect.objectContaining(expectedFinalShowState));
      expect(result).toEqual(expectedFinalShowState);
    });
    
    it('should throw NotFoundException if this.findOne in update fails', async () => {
        jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
        await expect(service.update(showId, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if preload returns null', async () => {
        const existingShowWithFinancesForPreload = createFullMockShow(showId, 'Original Title', {
          total_price: 1200, 
          total_collected: 300, 
        });
        jest.spyOn(service, 'findOne').mockResolvedValue(existingShowWithFinancesForPreload);
        mockShowRepository.preload.mockResolvedValue(null);
        await expect(service.update(showId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const showId = 'delete-s1';

    it('should remove the show successfully', async () => {
      mockShowRepository.delete.mockResolvedValue({ affected: 1, raw: [] } as any);
      
      await service.remove(showId);
      
      expect(mockShowRepository.delete).toHaveBeenCalledWith(showId);
    });

    it('should throw NotFoundException if show to remove is not found', async () => {
      mockShowRepository.delete.mockResolvedValue({ affected: 0, raw: [] } as any);
      
      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
      expect(mockShowRepository.delete).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('updateShowFinancesAfterPayment', () => {
    const showId = 'finance-show-id';
    const baseShowForFinance = createFullMockShow(showId, 'Finance Update Show', { total_price: 1000 });

    it('should correctly update finances when queryRunner is provided', async () => {
      const mockPayments = [
        { id: 'p1', amount: 100, is_deposit: true, payment_date: new Date('2024-01-01T10:00:00Z') } as Payment,
      ];
      const showWithPayments = { ...baseShowForFinance, payments: mockPayments };
      (mockFinanceQueryRunner.manager.getRepository(Show).findOne as jest.Mock).mockResolvedValue(showWithPayments);
      (mockFinanceQueryRunnerManagerRepo.save as jest.Mock).mockImplementation(async (entity) => entity as Show);

      const result = await service.updateShowFinancesAfterPayment(showId, mockFinanceQueryRunner);
      expect(mockFinanceQueryRunner.manager.getRepository).toHaveBeenCalledWith(Show);
      expect(mockFinanceQueryRunner.manager.getRepository(Show).findOne).toHaveBeenCalledWith({ where: { id: showId }, relations: ['payments'] });
      expect(result.total_collected).toBe(100);
      expect(mockFinanceQueryRunnerManagerRepo.save).toHaveBeenCalledWith(expect.objectContaining({ total_collected: 100 }));
    });

    it('should use main repository if queryRunner is null', async () => {
      const mockPayments = [
        { id: 'p1', amount: 100, is_deposit: true, payment_date: new Date('2024-01-01T10:00:00Z') } as Payment,
      ];
      const showWithPayments = { ...baseShowForFinance, payments: mockPayments };
      mockShowRepository.findOne.mockResolvedValue(showWithPayments); // Mock main repo's findOne
      mockShowRepository.save.mockImplementation(async (entity) => entity as Show); // Mock main repo's save

      const result = await service.updateShowFinancesAfterPayment(showId, null); // Pass null for queryRunner
      expect(mockShowRepository.findOne).toHaveBeenCalledWith({ where: { id: showId }, relations: ['payments'] });
      expect(result.total_collected).toBe(100);
      expect(mockShowRepository.save).toHaveBeenCalledWith(expect.objectContaining({ total_collected: 100 }));
      // Ensure queryRunner's repo was not used
      expect(mockFinanceQueryRunner.manager.getRepository(Show).findOne as jest.Mock).not.toHaveBeenCalled();
    });
    
    it('should throw NotFoundException if show not found (with queryRunner)', async () => {
        (mockFinanceQueryRunner.manager.getRepository(Show).findOne as jest.Mock).mockResolvedValue(null);
        await expect(service.updateShowFinancesAfterPayment(showId, mockFinanceQueryRunner)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if show not found (without queryRunner)', async () => {
        mockShowRepository.findOne.mockResolvedValue(null); // Mock main repo's findOne to return null
        await expect(service.updateShowFinancesAfterPayment(showId, null)).rejects.toThrow(NotFoundException); // Pass null for queryRunner
    });
  });
}); 