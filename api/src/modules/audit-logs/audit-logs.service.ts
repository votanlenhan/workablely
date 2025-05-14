import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { User } from '@/modules/users/entities/user.entity';
import { FindAuditLogsDto } from './dto/find-audit-logs.dto';
import { paginate, Pagination, IPaginationOptions } from 'nestjs-typeorm-paginate';

interface LogData {
  entity_name: string;
  entity_id: string;
  action: string;
  changed_by_user_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  details?: string;
}

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Creates an audit log entry.
   * This method should be called by other services after an action is performed.
   */
  async createLog(logData: LogData): Promise<AuditLog> {
    try {
      const newLog = this.auditLogRepository.create(logData);
      return await this.auditLogRepository.save(newLog);
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create audit log entry');
    }
  }

  /**
   * Finds audit logs with filtering and pagination
   */
  async findAll(findAuditLogsDto: FindAuditLogsDto): Promise<Pagination<AuditLog>> {
    try {
      const queryBuilder = this.auditLogRepository.createQueryBuilder('audit_log')
        .leftJoinAndSelect('audit_log.changed_by', 'changed_by_user')
        .orderBy('audit_log.change_timestamp', 'DESC');

      // Apply filters
      if (findAuditLogsDto.entity_name) {
        queryBuilder.andWhere('audit_log.entity_name = :entity_name', { entity_name: findAuditLogsDto.entity_name });
      }

      if (findAuditLogsDto.entity_id) {
        queryBuilder.andWhere('audit_log.entity_id = :entity_id', { entity_id: findAuditLogsDto.entity_id });
      }

      if (findAuditLogsDto.action) {
        queryBuilder.andWhere('audit_log.action = :action', { action: findAuditLogsDto.action });
      }

      if (findAuditLogsDto.changed_by_user_id) {
        queryBuilder.andWhere('audit_log.changed_by_user_id = :changed_by_user_id', { changed_by_user_id: findAuditLogsDto.changed_by_user_id });
      }

      if (findAuditLogsDto.start_date && findAuditLogsDto.end_date) {
        queryBuilder.andWhere('audit_log.change_timestamp BETWEEN :start_date AND :end_date', {
          start_date: findAuditLogsDto.start_date,
          end_date: findAuditLogsDto.end_date,
        });
      }

      const options: IPaginationOptions = {
        page: findAuditLogsDto.page || 1,
        limit: findAuditLogsDto.limit || 10,
      };

      return await paginate<AuditLog>(queryBuilder, options);
    } catch (error) {
      this.logger.error(`Failed to find audit logs: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to find audit logs');
    }
  }

  // Basic find methods can be added here if needed for an admin interface
  // For example, findByEntity, findByUser, etc. with pagination.
} 