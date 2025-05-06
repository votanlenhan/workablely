import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShowsService } from './shows.service';
import { Show, ShowStatus, ShowPaymentStatus } from './entities/show.entity';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { ClientsService } from '@/modules/clients/clients.service';
import { Client } from '@/modules/clients/entities/client.entity';
import { NotFoundException } from '@nestjs/common';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

// Mock the entire module - simplified
jest.mock('nestjs-typeorm-paginate', () => ({
    paginate: jest.fn(), // Return a simple mock function initially
}));

// Get the mocked function instance
const { paginate: mockPaginate } = require('nestjs-typeorm-paginate');

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
};

// Mock ClientsService
const mockClientsService = {
  findOne: jest.fn(),
};


describe('ShowsService', () => {
  let service: ShowsService;

  beforeEach(async () => {
    Object.values(mockShowRepository).forEach(mockFn => mockFn.mockClear());
    Object.values(mockQueryBuilder).forEach(mockFn => mockFn.mockClear());
    Object.values(mockClientsService).forEach(mockFn => mockFn.mockClear());
    mockShowRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    // Reset and setup default mock for paginate here
    mockPaginate.mockClear();
    mockPaginate.mockResolvedValue({
        items: [],
        meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
        links: { first: '', previous: '', next: '', last: '' },
    }); 

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
        // Provide mock UsersService later if needed
      ],
    }).compile();

    service = module.get<ShowsService>(ShowsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- CREATE Tests --- //
  describe('create', () => {
    const testDate = new Date();
    const createDto: CreateShowDto = {
        clientId: 'client-uuid-1',
        show_type: 'Wedding',
        start_datetime: testDate.toISOString(),
        total_price: 1000,
        deposit_amount: 200,
        deposit_date: '2024-01-01',
    };
    const creatorUserId = 'user-uuid-1';
    const mockClient: Partial<Client> = { id: 'client-uuid-1', name: 'Test Client', shows: [] };

    it('should create and return a show with client relation', async () => {
      const expectedShowPartial: Partial<Show> = {
          clientId: createDto.clientId,
          show_type: createDto.show_type,
          start_datetime: testDate,
          total_price: createDto.total_price,
          deposit_amount: createDto.deposit_amount,
          deposit_date: createDto.deposit_date,
          createdByUserId: creatorUserId,
          total_collected: 200,
          amount_due: 800,
          payment_status: ShowPaymentStatus.PARTIALLY_PAID,
          status: ShowStatus.PENDING,
          id: 'show-uuid-1',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          title: null,
          end_datetime: null,
          location_address: null,
          location_details: null,
          requirements: null,
          post_processing_deadline: null,
          delivered_at: null,
          completed_at: null,
          cancelled_at: null,
          cancellation_reason: null,
          client: mockClient as Client,
          createdBy: null,
          assignments: [],
      };

      mockClientsService.findOne.mockResolvedValue(mockClient);
      mockShowRepository.create.mockReturnValue({ ...expectedShowPartial, client: undefined, assignments: [] });
      mockShowRepository.save.mockResolvedValue(expectedShowPartial as Show);

      const result = await service.create(createDto, creatorUserId);

      expect(mockClientsService.findOne).toHaveBeenCalledWith(createDto.clientId);
      expect(mockShowRepository.create).toHaveBeenCalledWith(expect.objectContaining({
          ...createDto,
          createdByUserId: creatorUserId,
          total_collected: 200,
      }));
      expect(mockShowRepository.save).toHaveBeenCalledWith(expect.objectContaining({
          clientId: createDto.clientId,
          amount_due: 800,
          payment_status: ShowPaymentStatus.PARTIALLY_PAID,
          start_datetime: testDate,
          deposit_date: createDto.deposit_date,
      }));
      expect(result).toMatchObject(expectedShowPartial);
      expect(result.clientId).toEqual(createDto.clientId);
    });

    it('should throw NotFoundException if client does not exist', async () => {
        mockClientsService.findOne.mockRejectedValue(new NotFoundException());
        await expect(service.create(createDto, creatorUserId)).rejects.toThrow(NotFoundException);
        expect(mockShowRepository.create).not.toHaveBeenCalled();
        expect(mockShowRepository.save).not.toHaveBeenCalled();
    });

    it('should calculate initial state correctly with no deposit', async () => {
        const testDateNoDeposit = new Date();
        const createDtoNoDeposit: CreateShowDto = {
            clientId: 'client-uuid-1',
            show_type: 'Event',
            start_datetime: testDateNoDeposit.toISOString(),
            total_price: 1000,
        };

        const expectedShowPartial: Partial<Show> = {
            clientId: createDtoNoDeposit.clientId,
            show_type: createDtoNoDeposit.show_type,
            start_datetime: testDateNoDeposit,
            total_price: createDtoNoDeposit.total_price,
            deposit_amount: null,
            deposit_date: null,
            createdByUserId: creatorUserId,
            total_collected: 0,
            amount_due: 1000,
            payment_status: ShowPaymentStatus.UNPAID,
            status: ShowStatus.PENDING,
            id: 'show-uuid-2',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            title: null, end_datetime: null, location_address: null, location_details: null, requirements: null,
            post_processing_deadline: null, delivered_at: null, completed_at: null, cancelled_at: null,
            cancellation_reason: null,
            assignments: [],
        };

        mockClientsService.findOne.mockResolvedValue(mockClient);
        mockShowRepository.create.mockReturnValue(expectedShowPartial);
        mockShowRepository.save.mockResolvedValue(expectedShowPartial as Show);

        await service.create(createDtoNoDeposit, creatorUserId);

        expect(mockShowRepository.create).toHaveBeenCalledWith(expect.objectContaining({ total_collected: 0 }));
        expect(mockShowRepository.save).toHaveBeenCalledWith(expect.objectContaining({
            amount_due: 1000,
            payment_status: ShowPaymentStatus.UNPAID,
            deposit_amount: null,
            deposit_date: null,
            start_datetime: testDateNoDeposit
        }));
    });
  });

  // --- FINDALL Tests --- //
  describe('findAll', () => {
    it('should return a paginated list of shows with client relation loaded', async () => {
      const options: IPaginationOptions = { page: 1, limit: 10, route: '/shows' };
      const mockClientForShow1: Partial<Client> = { id: 'client-for-show1', name: 'Client Show 1', shows: [] };
      const show1: Partial<Show> = { 
          id: 'show-1', 
          title: 'Show 1', 
          clientId: mockClientForShow1.id, 
          client: mockClientForShow1 as Client 
      }; 
      const paginatedResult: Pagination<Show> = {
        items: [show1 as Show],
        meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
        links: { first: '/shows?limit=10', previous: '', next: '', last: '/shows?page=1&limit=10' }
      };

      mockPaginate.mockResolvedValue(paginatedResult);
      mockShowRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(options);

      expect(mockShowRepository.createQueryBuilder).toHaveBeenCalledWith('show');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('show.client', 'client');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('show.created_by_user', 'creator');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('show.start_datetime', 'DESC');
      expect(mockPaginate).toHaveBeenCalledWith(mockQueryBuilder, options);
      expect(result).toEqual(paginatedResult);
      expect(result.items[0].client).toBeDefined();
      expect(result.items[0].client.id).toEqual(mockClientForShow1.id);
    });
  });

  // --- FINDONE Tests --- //
  describe('findOne', () => {
    it('should return a show with client relation loaded if found', async () => {
      const showId = 'show-find-1';
      const mockClientForFindOne: Partial<Client> = { id: 'client-for-findone', name: 'Client FindOne', shows: [] };
      const expectedShow: Partial<Show> = { 
          id: showId, 
          title: 'Found Show', 
          clientId: mockClientForFindOne.id, 
          client: mockClientForFindOne as Client
      };
      mockShowRepository.findOne.mockResolvedValue(expectedShow as Show);

      const result = await service.findOne(showId);

      expect(mockShowRepository.findOne).toHaveBeenCalledWith({ 
          where: { id: showId }, 
          relations: ['client', 'created_by_user']
      });
      expect(result).toEqual(expectedShow);
      expect(result.client).toBeDefined();
      expect(result.client.id).toEqual(mockClientForFindOne.id);
    });

    it('should throw NotFoundException if show not found', async () => {
      const showId = 'not-found-show';
      mockShowRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(showId)).rejects.toThrow(NotFoundException);
    });
  });

  // --- UPDATE Tests --- //
  describe('update', () => {
    const showId = 'show-update-1';
    const testStartDate = new Date();
    const mockClient1: Client = { id: 'c1', name: 'Client 1', shows:[], email:null, phone_number:'1', address:null, source:null, notes:null, created_at: new Date(), updated_at: new Date() };
    const existingShow: Show = {
        id: showId, 
        clientId: mockClient1.id,
        show_type: 'Event', start_datetime: testStartDate,
        total_price: 500, total_collected: 100, amount_due: 400,
        payment_status: ShowPaymentStatus.PARTIALLY_PAID, status: ShowStatus.PENDING,
        createdAt: new Date(), updatedAt: new Date(), 
        client: mockClient1 as Client,
        createdBy: null,
        title: null, end_datetime: null, location_address: null, location_details: null, requirements: null,
        deposit_amount: 100, deposit_date: null, post_processing_deadline: null, delivered_at: null,
        completed_at: null, cancelled_at: null, cancellation_reason: null,
        createdByUserId: null,
        assignments: [],
    };

    it('should update basic fields and return the show, keeping clientId', async () => {
        const updateDto: UpdateShowDto = { title: 'Updated Title', requirements: 'New reqs' };
        const preloadedShow = { ...existingShow, ...updateDto, updatedAt: new Date() };

        mockShowRepository.findOne.mockResolvedValue(existingShow);
        mockShowRepository.preload.mockResolvedValue(preloadedShow);
        mockShowRepository.save.mockResolvedValue(preloadedShow);

        const result = await service.update(showId, updateDto);

        expect(mockShowRepository.findOne).toHaveBeenCalledWith({ where: { id: showId }, relations: ['client', 'created_by_user'] });
        expect(mockShowRepository.preload).toHaveBeenCalledWith({ id: showId, ...updateDto });
        expect(mockShowRepository.save).toHaveBeenCalledWith(preloadedShow);
        expect(result).toEqual(preloadedShow);
        expect(result.clientId).toEqual(mockClient1.id);
        expect(result.client).toEqual(mockClient1);
    });

    it('should update status and set relevant date, keeping clientId', async () => {
        const updateDto: UpdateShowDto = { status: ShowStatus.CANCELLED, cancellation_reason: 'Client request' };
        const preloadedShow = { ...existingShow, ...updateDto, updatedAt: new Date() };
        const savedShowWithDate = { ...preloadedShow, cancelled_at: new Date() };

        mockShowRepository.findOne.mockResolvedValue(existingShow);
        mockShowRepository.preload.mockResolvedValue(preloadedShow);
        mockShowRepository.save.mockResolvedValue(savedShowWithDate as Show);

        const result = await service.update(showId, updateDto);

        expect(mockShowRepository.save).toHaveBeenCalledWith(expect.objectContaining({ status: ShowStatus.CANCELLED, cancellation_reason: 'Client request' }));
        expect(mockShowRepository.save.mock.calls[0][0].cancelled_at).toBeInstanceOf(Date);
        expect(result.cancelled_at).toBeInstanceOf(Date);
        expect(result.clientId).toEqual(mockClient1.id);
    });

    it('should recalculate amounts if total_price changes, keeping clientId', async () => {
        const updateDto: UpdateShowDto = { total_price: 600 };
        const preloadedShow = { ...existingShow, ...updateDto, updatedAt: new Date() };
        const savedShow = { ...preloadedShow, amount_due: 500, payment_status: ShowPaymentStatus.PARTIALLY_PAID };

        mockShowRepository.findOne.mockResolvedValue(existingShow);
        mockShowRepository.preload.mockResolvedValue(preloadedShow);
        mockShowRepository.save.mockResolvedValue(savedShow as Show);

        const result = await service.update(showId, updateDto);

        expect(mockShowRepository.save).toHaveBeenCalledWith(expect.objectContaining({ amount_due: 500 }));
        expect(result.clientId).toEqual(mockClient1.id);
    });

    it('should validate and update clientId if changed', async () => {
        const updateDto: UpdateShowDto = { clientId: 'c2' };
        const mockClient2: Partial<Client> = { id: 'c2', name: 'Client 2', shows:[] };
        const preloadedShow = { ...existingShow, clientId: 'c2', updatedAt: new Date() };
        const savedShow = { ...preloadedShow, client: mockClient2 as Client }; 

        mockShowRepository.findOne.mockResolvedValue(existingShow);
        mockClientsService.findOne.mockResolvedValue(mockClient2);
        mockShowRepository.preload.mockResolvedValue(preloadedShow);
        mockShowRepository.save.mockResolvedValue(savedShow as Show);

        const result = await service.update(showId, updateDto);

        expect(mockShowRepository.findOne).toHaveBeenCalledWith({ where: { id: showId }, relations: ['client', 'created_by_user'] });
        expect(mockClientsService.findOne).toHaveBeenCalledWith('c2');
        expect(mockShowRepository.preload).toHaveBeenCalledWith({ id: showId, clientId: 'c2' }); 
        expect(mockShowRepository.save).toHaveBeenCalledWith(expect.objectContaining({ clientId: 'c2' })); 
        expect(result).toEqual(savedShow);
        expect(result.clientId).toEqual('c2');
    });

     it('should throw error if updated clientId does not exist', async () => {
        const updateDto: UpdateShowDto = { clientId: 'c-not-found' };

        mockShowRepository.findOne.mockResolvedValue(existingShow);
        mockClientsService.findOne.mockRejectedValue(new NotFoundException());

        await expect(service.update(showId, updateDto)).rejects.toThrow(NotFoundException);
        expect(mockClientsService.findOne).toHaveBeenCalledWith('c-not-found');
        expect(mockShowRepository.preload).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if show to update is not found by findOne', async () => {
      const updateDto: UpdateShowDto = { title: 'Wont happen' };
      mockShowRepository.findOne.mockResolvedValue(null);

      await expect(service.update(showId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  // --- RECORD PAYMENT Tests --- //
  describe('recordPayment', () => {
    const showId = 'show-payment-1';
    const testStartDatePayment = new Date();
    const mockClientPayment: Client = {id:'c1', name:'Client Pay', shows:[], email:null, phone_number:'1', address:null, source:null, notes:null, created_at: new Date(), updated_at: new Date()};
    const initialShow: Show = {
        id: showId, 
        clientId: mockClientPayment.id,
        show_type: 'Product', start_datetime: testStartDatePayment,
        total_price: 200, total_collected: 50, amount_due: 150,
        payment_status: ShowPaymentStatus.PARTIALLY_PAID, status: ShowStatus.DELIVERED,
        createdAt: new Date(), updatedAt: new Date(), 
        client: mockClientPayment as Client,
        createdBy: null,
        title: null, end_datetime: null, location_address: null, location_details: null, requirements: null,
        deposit_amount: 50, deposit_date: null, post_processing_deadline: null, delivered_at: null,
        completed_at: null, cancelled_at: null, cancellation_reason: null,
        createdByUserId: null,
        assignments: [],
    };

    it('should update payment details and return show with client relation', async () => {
        const paymentAmount = 100;
        const expectedUpdatedShow = { 
            ...initialShow, 
            total_collected: 150, 
            amount_due: 50, 
            payment_status: ShowPaymentStatus.PARTIALLY_PAID 
        };

        mockShowRepository.findOne.mockResolvedValue(initialShow);
        mockShowRepository.save.mockResolvedValue(expectedUpdatedShow as Show);

        const result = await service.recordPayment(showId, paymentAmount);

        expect(mockShowRepository.findOne).toHaveBeenCalledWith({ where: { id: showId }, relations: ['client', 'created_by_user'] });
        expect(mockShowRepository.save).toHaveBeenCalledWith(expect.objectContaining({
            total_collected: 150,
            amount_due: 50,
            payment_status: ShowPaymentStatus.PARTIALLY_PAID,
        }));
        expect(result).toEqual(expectedUpdatedShow);
        expect(result.client).toBeDefined();
        expect(result.client.id).toEqual(mockClientPayment.id);
    });

    it('should update payment_status to PAID when fully paid, returning client relation', async () => {
        const paymentAmount = 150;
        const initialShowForThisTest: Show = { // Redefined for clarity and to ensure total_collected is 50
            id: showId, clientId: mockClientPayment.id, show_type: 'Portrait', start_datetime: new Date(),
            title:'Payment Test Full', status: ShowStatus.CONFIRMED, total_price: 200, total_collected: 50, amount_due: 150,
            payment_status: ShowPaymentStatus.PARTIALLY_PAID, createdAt: new Date(), updatedAt: new Date(),
            end_datetime: null, location_address: null, location_details: null, requirements: null,
            deposit_amount: 50, deposit_date: '2024-01-01', post_processing_deadline: null, delivered_at: null,
            completed_at: null, cancelled_at: null, cancellation_reason: null,
            createdByUserId: null,
            client: mockClientPayment,
            createdBy: null,
            assignments: [], // Added missing property
        };
        // Correct the expected total_collected and status
        const expectedUpdatedShow = { ...initialShowForThisTest, total_collected: 200, amount_due: 0, payment_status: ShowPaymentStatus.PAID };

        mockShowRepository.findOne.mockResolvedValue(initialShowForThisTest);
        mockShowRepository.save.mockResolvedValue(expectedUpdatedShow as Show);

        const result = await service.recordPayment(showId, paymentAmount);

        // Expect both relations to be loaded by findOne
        expect(mockShowRepository.findOne).toHaveBeenCalledWith({ where: { id: showId }, relations: ['client', 'created_by_user'] });
        expect(mockShowRepository.save).toHaveBeenCalledWith(expect.objectContaining({
            id: showId,
            total_collected: 200,
            amount_due: 0,
            payment_status: ShowPaymentStatus.PAID,
        }));
        expect(result).toEqual(expectedUpdatedShow);
        expect(result.client).toEqual(mockClientPayment); // Verify relation is returned
    });

    it('should throw NotFoundException if show not found', async () => {
        mockShowRepository.findOne.mockResolvedValue(null);
        await expect(service.recordPayment('not-found', 50)).rejects.toThrow(NotFoundException);
    });
  });

  // --- REMOVE Tests --- //
  describe('remove', () => {
    it('should remove the show successfully', async () => {
      const showId = 'show-remove-1';
      mockShowRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await expect(service.remove(showId)).resolves.toBeUndefined();
      expect(mockShowRepository.delete).toHaveBeenCalledWith(showId);
    });

    it('should throw NotFoundException if show to remove is not found', async () => {
      const showId = 'non-existent-show-remove';
      mockShowRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.remove(showId)).rejects.toThrow(NotFoundException);
      expect(mockShowRepository.delete).toHaveBeenCalledWith(showId);
    });
  });
}); 