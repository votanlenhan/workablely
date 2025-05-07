import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
  Post,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
  SetMetadata,
} from '@nestjs/common';
import { RevenueAllocationsService } from './revenue-allocations.service';
import { RevenueAllocationDto } from './dto/revenue-allocation.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard, ROLES_KEY } from '../../core/guards/roles.guard';
import { RoleName } from '../roles/entities/role-name.enum';
import { Roles } from '../../core/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Pagination } from 'nestjs-typeorm-paginate';
import { RevenueAllocation } from './entities/revenue-allocation.entity';

@ApiTags('Revenue Allocations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('revenue-allocations')
export class RevenueAllocationsController {
  constructor(private readonly revenueAllocationsService: RevenueAllocationsService) {}

  @Post('shows/:showId/trigger-calculation')
  @Roles(RoleName.MANAGER, RoleName.ADMIN)
  @ApiOperation({ summary: 'Manually trigger revenue allocation calculation for a show' })
  @ApiParam({ name: 'showId', description: 'The ID of the show to calculate allocations for' })
  @HttpCode(HttpStatus.OK)
  async triggerAllocationsForShow(@Param('showId') showId: string): Promise<RevenueAllocation[]> {
    return this.revenueAllocationsService.calculateAndSaveAllocationsForShow(showId);
  }

  @Get('shows/:showId')
  @Roles(RoleName.MANAGER, RoleName.ADMIN, RoleName.PHOTOGRAPHER)
  @ApiOperation({ summary: 'Get all revenue allocations for a specific show (paginated)' })
  @ApiParam({ name: 'showId', description: 'The ID of the show' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', type: Number, example: 10 })
  async findAllByShowId(
    @Param('showId') showId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Pagination<RevenueAllocation>> {
    limit = limit > 100 ? 100 : limit;
    return this.revenueAllocationsService.findAllByShowId(showId, { page, limit, route: `/shows/${showId}/revenue-allocations` });
  }

  @Get(':id')
  @Roles(RoleName.MANAGER, RoleName.ADMIN, RoleName.PHOTOGRAPHER)
  @ApiOperation({ summary: 'Get a specific revenue allocation by its ID' })
  @ApiParam({ name: 'id', description: 'The ID of the revenue allocation' })
  async findOne(@Param('id') id: string): Promise<RevenueAllocation> {
    return this.revenueAllocationsService.findOne(id);
  }
} 