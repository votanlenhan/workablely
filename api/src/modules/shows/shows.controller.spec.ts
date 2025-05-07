import { Test, TestingModule } from '@nestjs/testing';
import { ShowsController } from './shows.controller';
import { ShowsService } from './shows.service';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { RoleName } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { Show, ShowStatus } from './entities/show.entity';
import { Pagination } from 'nestjs-typeorm-paginate';

// Mock Service Type Helper (Explicit definition)
type MockShowsService = {
  create: jest.Mock;
  findAll: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
};

// Function to create the mock service instance
const createMockShowsService = (): MockShowsService => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('ShowsController', () => {
  let controller: ShowsController;
  let service: MockShowsService;

  const mockUser = { id: 'user-shows-test-id', roles: [{ name: RoleName.MANAGER }] } as User;
  const mockReq = { user: mockUser, path: '/shows' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShowsController],
      providers: [
        { provide: ShowsService, useFactory: createMockShowsService },
      ],
    })
    .overrideGuard(JwtAuthGuard).useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard).useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<ShowsController>(ShowsController);
    service = module.get(ShowsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Test Cases for create() ---
  describe('create', () => {
    const createDto: CreateShowDto = { clientId: 'c1', show_type: 'Wedding', start_datetime: new Date().toISOString(), total_price: 1000 };
    const createdShow: Partial<Show> = { 
        id: 's1', 
        clientId: createDto.clientId,
        show_type: createDto.show_type,
        start_datetime: new Date(createDto.start_datetime),
        total_price: createDto.total_price,
        status: ShowStatus.PENDING,
        payments: [], equipmentAssignments: [], assignments: []
    };

    it('should call service.create and return the result', async () => {
      service.create.mockResolvedValue(createdShow as Show);

      const result = await controller.create(createDto, mockReq as any);

      expect(service.create).toHaveBeenCalledWith(createDto, mockUser.id);
      expect(result).toEqual(createdShow);
    });

    it('should forward errors from the service', async () => {
      service.create.mockRejectedValue(new ForbiddenException('Client creation error'));

      await expect(controller.create(createDto, mockReq as any)).rejects.toThrow(ForbiddenException);
    });
  });

  // --- Test Cases for findAll() ---
  describe('findAll', () => {
    const show1: Partial<Show> = { id: 's1', clientId: 'c1', payments: [], equipmentAssignments: [], assignments: [] };
    const paginatedResult: Pagination<Show> = {
      items: [show1 as Show],
      meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
      links: { first: '', previous: '', next: '', last: '' }
    };

    it('should call service.findAll with pagination options and return the result', async () => {
      service.findAll.mockResolvedValue(paginatedResult);
      const options = { page: 1, limit: 10, route: '/shows' };

      const result = await controller.findAll(mockReq as any, options.page, options.limit);

      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining(options));
      expect(result).toEqual(paginatedResult);
    });

     it('should handle default pagination values', async () => {
      service.findAll.mockResolvedValue(paginatedResult);
      const expectedOptions = { page: 1, limit: 10, route: '/shows' };

      await controller.findAll(mockReq as any, undefined, undefined);

      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining(expectedOptions));
    });

     it('should cap limit at 100', async () => {
      service.findAll.mockResolvedValue(paginatedResult);
      const expectedOptions = { page: 1, limit: 100, route: '/shows' };

      await controller.findAll(mockReq as any, 1, 200);

      expect(service.findAll).toHaveBeenCalledWith(expect.objectContaining(expectedOptions));
    });
  });

  // --- Test Cases for findOne() ---
  describe('findOne', () => {
    const showId = 'find-s1';
    const foundShow: Partial<Show> = { id: showId, clientId: 'c1', payments: [], equipmentAssignments: [], assignments: [] };

    it('should call service.findOne and return the result', async () => {
      service.findOne.mockResolvedValue(foundShow as Show);

      const result = await controller.findOne(showId);

      expect(service.findOne).toHaveBeenCalledWith(showId);
      expect(result).toEqual(foundShow);
    });

    it('should throw NotFoundException if service throws NotFoundException', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(showId)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Test Cases for update() ---
  describe('update', () => {
    const showId = 'update-s1';
    const updateDto: UpdateShowDto = { title: 'Updated Show' };
    const updatedShow: Partial<Show> = { id: showId, title: 'Updated Show', payments: [], equipmentAssignments: [], assignments: [] };

    it('should call service.update and return the result', async () => {
      service.update.mockResolvedValue(updatedShow as Show);

      const result = await controller.update(showId, updateDto);

      expect(service.update).toHaveBeenCalledWith(showId, updateDto);
      expect(result).toEqual(updatedShow);
    });

    it('should forward NotFoundException from the service', async () => {
      service.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update(showId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Test Cases for remove() ---
  describe('remove', () => {
    const showId = 'delete-s1';

    it('should call service.remove successfully', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(showId);

      expect(service.remove).toHaveBeenCalledWith(showId);
    });

    it('should forward NotFoundException from the service', async () => {
      service.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(showId)).rejects.toThrow(NotFoundException);
    });
  });

}); 