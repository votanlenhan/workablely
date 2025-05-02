import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  // providers: [AuditLogService], // Service to create logs
  // exports: [AuditLogService],
})
export class AuditLogsModule {}
