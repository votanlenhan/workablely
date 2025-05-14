import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';
import { FindAuditLogsDto } from './dto/find-audit-logs.dto';
import { AuditLog } from './entities/audit-log.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ForbiddenException } from '@nestjs/common';

describe('AuditLogsController', () => {
  let controller: AuditLogsController;
  let service: AuditLogsService;

  const mockAuditLogsService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogsController],
      providers: [
        {
          provide: AuditLogsService,
          useValue: mockAuditLogsService,
        },
      ],
    }).compile();

    controller = module.get<AuditLogsController>(AuditLogsController);
    service = module.get<AuditLogsService>(AuditLogsService);

    // Reset all mocks before each test
    Object.values(mockAuditLogsService).forEach(fn => {
      if (typeof fn === 'function' && 'mockReset' in fn) {
        (fn as jest.Mock).mockReset();
      }
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    const mockPagination: Pagination<AuditLog> = {
      items: [],
      meta: {
        totalItems: 0,
        itemCount: 0,
        itemsPerPage: 10,
        totalPages: 0,
        currentPage: 1,
      },
      links: {
        first: '',
        previous: '',
        next: '',
        last: '',
      },
    };

    it('should return paginated audit logs with default parameters', async () => {
      const findDto = new FindAuditLogsDto();
      mockAuditLogsService.findAll.mockResolvedValue(mockPagination);

      const result = await controller.findAll(findDto);

      expect(service.findAll).toHaveBeenCalledWith(findDto);
      expect(result).toEqual(mockPagination);
    });

    it('should return paginated audit logs with custom parameters', async () => {
      const findDto: FindAuditLogsDto = {
        page: 2,
        limit: 20,
        entity_name: 'User',
        entity_id: '123',
        action: 'UPDATE',
        changed_by_user_id: '456',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-31T23:59:59Z',
      };

      const customPagination = {
        ...mockPagination,
        meta: {
          ...mockPagination.meta,
          currentPage: 2,
          itemsPerPage: 20,
        },
      };

      mockAuditLogsService.findAll.mockResolvedValue(customPagination);

      const result = await controller.findAll(findDto);

      expect(service.findAll).toHaveBeenCalledWith(findDto);
      expect(result).toEqual(customPagination);
    });

    it('should handle service errors gracefully', async () => {
      const findDto = new FindAuditLogsDto();
      mockAuditLogsService.findAll.mockRejectedValue(new Error('Service error'));

      await expect(controller.findAll(findDto)).rejects.toThrow();
    });

    it('should handle validation errors gracefully', async () => {
      const findDto = new FindAuditLogsDto();
      findDto.page = -1; // Invalid page number
      mockAuditLogsService.findAll.mockRejectedValue(new Error('Validation error'));

      await expect(controller.findAll(findDto)).rejects.toThrow();
    });

    it('should handle empty results correctly', async () => {
      const findDto = new FindAuditLogsDto();
      const emptyPagination = {
        ...mockPagination,
        items: [],
        meta: {
          ...mockPagination.meta,
          totalItems: 0,
          itemCount: 0,
        },
      };

      mockAuditLogsService.findAll.mockResolvedValue(emptyPagination);

      const result = await controller.findAll(findDto);

      expect(service.findAll).toHaveBeenCalledWith(findDto);
      expect(result).toEqual(emptyPagination);
      expect(result.items).toHaveLength(0);
    });

    it('should handle large result sets correctly', async () => {
      const findDto = new FindAuditLogsDto();
      const largePagination = {
        ...mockPagination,
        items: Array(100).fill({}).map((_, index) => ({
          id: `log-${index}`,
          entity_name: 'User',
          entity_id: '123',
          action: 'UPDATE',
          change_timestamp: new Date().toISOString(),
        })),
        meta: {
          ...mockPagination.meta,
          totalItems: 100,
          itemCount: 100,
        },
      };

      mockAuditLogsService.findAll.mockResolvedValue(largePagination);

      const result = await controller.findAll(findDto);

      expect(service.findAll).toHaveBeenCalledWith(findDto);
      expect(result).toEqual(largePagination);
      expect(result.items).toHaveLength(100);
    });
  });
}); 