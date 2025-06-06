import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditLogsService } from './audit-logs.service';
import { AuditLog } from './entities/audit-log.entity';
import { FindAuditLogsDto } from './dto/find-audit-logs.dto';
import { paginate } from 'nestjs-typeorm-paginate';
import { InternalServerErrorException } from '@nestjs/common';

jest.mock('nestjs-typeorm-paginate', () => ({
  paginate: jest.fn(),
}));

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  const mockAuditLogRepository: any = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditLogRepository,
        },
      ],
    }).compile();

    service = module.get<AuditLogsService>(AuditLogsService);
    // Ensure the service uses the mock repository
    (service as any).auditLogRepository = mockAuditLogRepository;
    // Reset all mocks before each test
    Object.values(mockAuditLogRepository).forEach(fn => {
      if (typeof fn === 'function' && 'mockReset' in fn) {
        (fn as jest.Mock).mockReset();
      }
    });

    // Mock paginate to return a valid Pagination object
    (paginate as jest.Mock).mockResolvedValue({
      items: [],
      meta: {
        itemCount: 0,
        totalItems: 0,
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
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLog', () => {
    it('should create an audit log entry with all fields', async () => {
      const logData = {
        entity_name: 'test_entity',
        entity_id: '123',
        action: 'CREATE',
        changed_by_user_id: 'user123',
        old_values: { name: 'old name' },
        new_values: { name: 'new name' },
        details: 'Test details',
      };

      const mockAuditLog = new AuditLog();
      Object.assign(mockAuditLog, logData);

      mockAuditLogRepository.create.mockReturnValue(mockAuditLog);
      mockAuditLogRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.createLog(logData);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(logData);
      expect(mockAuditLogRepository.save).toHaveBeenCalledWith(mockAuditLog);
      expect(result).toEqual(mockAuditLog);
    });

    it('should create an audit log entry with minimal required fields', async () => {
      const logData = {
        entity_name: 'test_entity',
        entity_id: '123',
        action: 'CREATE',
      };

      const mockAuditLog = new AuditLog();
      Object.assign(mockAuditLog, logData);

      mockAuditLogRepository.create.mockReturnValue(mockAuditLog);
      mockAuditLogRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.createLog(logData);

      expect(mockAuditLogRepository.create).toHaveBeenCalledWith(logData);
      expect(mockAuditLogRepository.save).toHaveBeenCalledWith(mockAuditLog);
      expect(result).toEqual(mockAuditLog);
    });

    it('should handle database errors gracefully', async () => {
      const logData = {
        entity_name: 'test_entity',
        entity_id: '123',
        action: 'CREATE',
      };

      mockAuditLogRepository.create.mockReturnValue(new AuditLog());
      mockAuditLogRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createLog(logData)).rejects.toThrow(InternalServerErrorException);
      await expect(service.createLog(logData)).rejects.toThrow('Failed to create audit log entry');
    });

    it('should handle validation errors gracefully', async () => {
      const logData = {
        entity_name: '', // Invalid empty string
        entity_id: '123',
        action: 'CREATE',
      };

      mockAuditLogRepository.create.mockReturnValue(new AuditLog());
      mockAuditLogRepository.save.mockRejectedValue(new Error('Validation error'));

      await expect(service.createLog(logData)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    const mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      cache: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      getOne: jest.fn().mockResolvedValue(null),
      getCount: jest.fn().mockResolvedValue(0),
      clone: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
    };

    beforeEach(() => {
      mockAuditLogRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should return paginated audit logs with no filters', async () => {
      const findAuditLogsDto = new FindAuditLogsDto();
      findAuditLogsDto.page = 1;
      findAuditLogsDto.limit = 10;

      const result = await service.findAll(findAuditLogsDto);

      expect(mockAuditLogRepository.createQueryBuilder).toHaveBeenCalledWith('audit_log');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('audit_log.changed_by', 'changed_by_user');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('audit_log.change_timestamp', 'DESC');
      expect(result).toBeDefined();
    });

    it('should apply all filters when provided', async () => {
      const findAuditLogsDto: FindAuditLogsDto = {
        page: 1,
        limit: 10,
        entity_name: 'User',
        entity_id: '123',
        action: 'UPDATE',
        changed_by_user_id: '456',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-31T23:59:59Z',
      };

      const result = await service.findAll(findAuditLogsDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit_log.entity_name = :entity_name', { entity_name: 'User' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit_log.entity_id = :entity_id', { entity_id: '123' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit_log.action = :action', { action: 'UPDATE' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit_log.changed_by_user_id = :changed_by_user_id', { changed_by_user_id: '456' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audit_log.change_timestamp BETWEEN :start_date AND :end_date',
        {
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-01-31T23:59:59Z',
        },
      );
      expect(result).toBeDefined();
    });

    it('should handle query builder errors gracefully', async () => {
      const findAuditLogsDto = new FindAuditLogsDto();
      // Make createQueryBuilder throw directly to simulate a real query builder error
      mockAuditLogRepository.createQueryBuilder.mockImplementation(() => { throw new Error('Query builder error'); });
      await expect(service.findAll(findAuditLogsDto)).rejects.toThrow();
    });

    it('should handle pagination errors gracefully', async () => {
      const findAuditLogsDto = new FindAuditLogsDto();
      (paginate as jest.Mock).mockRejectedValue(new Error('Pagination error'));

      await expect(service.findAll(findAuditLogsDto)).rejects.toThrow();
    });
  });
}); 