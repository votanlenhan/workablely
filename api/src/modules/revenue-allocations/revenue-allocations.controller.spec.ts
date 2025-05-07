import { Test, TestingModule } from '@nestjs/testing';
import { RevenueAllocationsController } from './revenue-allocations.controller';
import { RevenueAllocationsService } from './revenue-allocations.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { CanActivate, HttpStatus } from '@nestjs/common';
import { RevenueAllocation } from './entities/revenue-allocation.entity';
import { Pagination, IPaginationMeta } from 'nestjs-typeorm-paginate';

// Mock Guards
const mockJwtAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };
const mockRolesGuard: CanActivate = { canActivate: jest.fn(() => true) };

// Helper to create a valid mock IPaginationMeta
const createMockPaginationMeta = (options: Partial<IPaginationMeta> = {}): IPaginationMeta => ({
  itemCount: 0,
  totalItems: 0,
  itemsPerPage: 10,
  totalPages: 0,
  currentPage: 1,
  ...options,
});

describe('RevenueAllocationsController', () => {
  let controller: RevenueAllocationsController;
  let service: RevenueAllocationsService;

  const mockRevenueAllocationsService = {
    findAllByShowId: jest.fn(),
    findOne: jest.fn(),
    calculateAndSaveAllocationsForShow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RevenueAllocationsController],
      providers: [
        { provide: RevenueAllocationsService, useValue: mockRevenueAllocationsService },
      ],
    })
    .overrideGuard(JwtAuthGuard).useValue(mockJwtAuthGuard)
    .overrideGuard(RolesGuard).useValue(mockRolesGuard)
    .compile();

    controller = module.get<RevenueAllocationsController>(RevenueAllocationsController);
    service = module.get<RevenueAllocationsService>(RevenueAllocationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllByShowId', () => {
    it('should return paginated revenue allocations for a show', async () => {
      const showId = 'show-uuid';
      const page = 1;
      const limit = 10;
      const mockMeta = createMockPaginationMeta({ itemCount: 0, totalItems: 0, itemsPerPage: limit, currentPage: page });
      const mockResult: Pagination<RevenueAllocation> = { items: [], meta: mockMeta }; 
      mockRevenueAllocationsService.findAllByShowId.mockResolvedValue(mockResult);

      const result = await controller.findAllByShowId(showId, page, limit);
      expect(service.findAllByShowId).toHaveBeenCalledWith(showId, { page, limit, route: `/shows/${showId}/revenue-allocations` });
      expect(result).toEqual(mockResult);
    });
  });

  describe('findOne', () => {
    it('should return a single revenue allocation', async () => {
      const allocId = 'alloc-uuid';
      const mockAlloc = { id: allocId, amount: 100 } as RevenueAllocation;
      mockRevenueAllocationsService.findOne.mockResolvedValue(mockAlloc);

      const result = await controller.findOne(allocId);
      expect(service.findOne).toHaveBeenCalledWith(allocId);
      expect(result).toEqual(mockAlloc);
    });
  });

  describe('triggerAllocationsForShow', () => {
    it('should trigger allocation calculation and return the result', async () => {
      const showId = 'show-trigger-uuid';
      const mockAllocations = [{ id: 'alloc1', amount: 50 }] as RevenueAllocation[];
      mockRevenueAllocationsService.calculateAndSaveAllocationsForShow.mockResolvedValue(mockAllocations);

      const result = await controller.triggerAllocationsForShow(showId);
      expect(service.calculateAndSaveAllocationsForShow).toHaveBeenCalledWith(showId);
      expect(result).toEqual(mockAllocations);
    });
  });
}); 