import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  SetMetadata,
  DefaultValuePipe,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ExternalIncomesService } from './external-incomes.service';
import { CreateExternalIncomeDto } from './dto/create-external-income.dto';
import { UpdateExternalIncomeDto } from './dto/update-external-income.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard, ROLES_KEY } from '../../core/guards/roles.guard';
import { RoleName } from '../roles/entities/role.entity';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ExternalIncome } from './entities/external-income.entity';

@ApiTags('External Incomes')
@ApiBearerAuth()
@Controller('external-incomes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExternalIncomesController {
  constructor(private readonly externalIncomesService: ExternalIncomesService) {}

  @Post()
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER])
  @ApiOperation({ summary: 'Create a new external income record [Admin, Manager]' })
  @ApiResponse({ status: 201, description: 'External income created.', type: ExternalIncome })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createExternalIncomeDto: CreateExternalIncomeDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ExternalIncome> {
    const userId = req.user.id;
    return this.externalIncomesService.create(createExternalIncomeDto, userId);
  }

  @Get()
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER]) // Or broader if needed
  @ApiOperation({ summary: 'Get all external incomes with pagination [Admin, Manager]' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'recorded_by_user_id', required: false, type: String, description: 'Filter by user ID who recorded the income' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Filter by year of income date' })
  @ApiQuery({ name: 'month', required: false, type: Number, description: 'Filter by month of income date (1-12)' })
  @ApiResponse({ status: 200, description: 'Paginated list of external incomes.', type: Pagination<ExternalIncome> })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('recorded_by_user_id') recordedByUserId?: string,
    @Query('year', new DefaultValuePipe(null), new ParseIntPipe({ optional: true })) year?: number,
    @Query('month', new DefaultValuePipe(null), new ParseIntPipe({ optional: true })) month?: number,
  ): Promise<Pagination<ExternalIncome>> {
    limit = limit > 100 ? 100 : limit; // Cap limit
    
    // Managers should only see their own recorded incomes unless an explicit recorded_by_user_id for themselves is passed
    // Admins can see all or filter by any user.
    let effectiveRecordedByUserId = recordedByUserId;
    if (!req.user.roles.some(role => role.name === RoleName.ADMIN) && !recordedByUserId) {
        effectiveRecordedByUserId = req.user.id;
    } else if (!req.user.roles.some(role => role.name === RoleName.ADMIN) && recordedByUserId !== req.user.id) {
        // Manager trying to query for someone else's incomes without being an admin - deny or force to their own
        // Forcing to their own if they try to specify someone else.
        effectiveRecordedByUserId = req.user.id;
    }

    return this.externalIncomesService.findAll(
      { page, limit, route: 'external-incomes' },
      effectiveRecordedByUserId,
      year,
      month,
    );
  }

  @Get(':id')
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER])
  @ApiOperation({ summary: 'Get external income by ID [Admin, Manager]' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'External income details.', type: ExternalIncome })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'External income not found.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<ExternalIncome> {
    const income = await this.externalIncomesService.findOne(id);
    // Check if manager is trying to access an income not recorded by them
    if (
      !req.user.roles.some(role => role.name === RoleName.ADMIN) &&
      income.recorded_by_user_id !== req.user.id
    ) {
      // This will be caught by RolesGuard or specific logic in service if findOne itself restricts
      // For now, explicit check. Consider moving to service or a more generic guard.
      throw new ForbiddenException('You are not authorized to view this external income.');
    }
    return income;
  }

  @Patch(':id')
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER])
  @ApiOperation({ summary: 'Update external income by ID [Admin, Manager]' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'External income updated.', type: ExternalIncome })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'External income not found.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExternalIncomeDto: UpdateExternalIncomeDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ExternalIncome> {
    const incomeToUpdate = await this.externalIncomesService.findOne(id);
    if (
      !req.user.roles.some(role => role.name === RoleName.ADMIN) &&
      incomeToUpdate.recorded_by_user_id !== req.user.id
    ) {
      throw new ForbiddenException('You are not authorized to update this external income.');
    }
    // Pass userId to service if service needs to re-verify or for audit logging in future
    return this.externalIncomesService.update(id, updateExternalIncomeDto /*, req.user.id */);
  }

  @Delete(':id')
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER])
  @ApiOperation({ summary: 'Delete external income by ID [Admin, Manager]' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'External income deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'External income not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    const incomeToDelete = await this.externalIncomesService.findOne(id);
    if (
      !req.user.roles.some(role => role.name === RoleName.ADMIN) &&
      incomeToDelete.recorded_by_user_id !== req.user.id
    ) {
      throw new ForbiddenException('You are not authorized to delete this external income.');
    }
    return this.externalIncomesService.remove(id);
  }
} 