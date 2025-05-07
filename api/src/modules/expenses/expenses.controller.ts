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
  ParseBoolPipe,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
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
import { Expense } from './entities/expense.entity';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER])
  @ApiOperation({ summary: 'Create a new expense [Admin, Manager Only]' })
  @ApiResponse({ status: 201, description: 'Expense created.', type: Expense })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(
    @Body() createExpenseDto: CreateExpenseDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Expense> {
    return this.expensesService.create(createExpenseDto, req.user.id);
  }

  @Get()
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER])
  @ApiOperation({ summary: 'Get all expenses with pagination [Admin, Manager Only]' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page', example: 10 })
  @ApiQuery({ name: 'recorded_by_user_id', required: false, type: String, format: 'uuid', description: 'Filter by user who recorded the expense' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filter by expense category' })
  @ApiQuery({ name: 'is_wishlist_expense', required: false, type: Boolean, description: 'Filter by wishlist status' })
  @ApiQuery({ name: 'month', required: false, type: Number, description: 'Filter by month (1-12) of expense_date' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Filter by year (YYYY) of expense_date' })
  @ApiResponse({ status: 200, description: 'Paginated list of expenses.', type: [Expense] }) // Swagger might need a more specific paginated type
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('recorded_by_user_id', new ParseUUIDPipe({ optional: true, version: '4' })) recorded_by_user_id?: string,
    @Query('category') category?: string,
    @Query('is_wishlist_expense', new ParseBoolPipe({ optional: true })) is_wishlist_expense?: boolean,
    @Query('month', new ParseIntPipe({ optional: true })) month?: number,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
  ): Promise<Pagination<Expense>> {
    return this.expensesService.findAll(
        { page, limit, route: '/api/expenses' },
        { recorded_by_user_id, category, is_wishlist_expense, month, year }
    );
  }

  @Get(':id')
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER])
  @ApiOperation({ summary: 'Get an expense by ID [Admin, Manager Only]' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Expense ID' })
  @ApiResponse({ status: 200, description: 'Expense details.', type: Expense })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Expense not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Expense> {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER])
  @ApiOperation({ summary: 'Update an expense by ID [Admin, Manager Only]' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Expense ID' })
  @ApiResponse({ status: 200, description: 'Expense updated.', type: Expense })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Expense not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    // @Req() req: AuthenticatedRequest, // If we need updatedByUserId
  ): Promise<Expense> {
    return this.expensesService.update(id, updateExpenseDto /*, req.user.id */);
  }

  @Delete(':id')
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an expense by ID [Admin, Manager Only]' })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Expense ID' })
  @ApiResponse({ status: 204, description: 'Expense deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Expense not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.expensesService.remove(id);
  }
} 