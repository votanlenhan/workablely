import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { FindAuditLogsDto } from './dto/find-audit-logs.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { RoleName } from '@/modules/roles/entities/role-name.enum';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditLog } from './entities/audit-log.entity';
import { Pagination } from 'nestjs-typeorm-paginate';

@ApiTags('audit-logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN) // Only admins can access audit logs
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get audit logs with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated audit logs' })
  async findAll(@Query() findAuditLogsDto: FindAuditLogsDto): Promise<Pagination<AuditLog>> {
    return this.auditLogsService.findAll(findAuditLogsDto);
  }
} 