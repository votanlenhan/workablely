import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { RoleName } from '../roles/entities/role.entity';
import { Payment } from './entities/payment.entity';
import { Request } from 'express';
import { Pagination } from 'nestjs-typeorm-paginate';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully.', type: Payment })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createPaymentDto: CreatePaymentDto, @Req() req: Request) {
    const user = req.user as { id: string };
    return this.paymentsService.create(createPaymentDto, user.id);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get all payments with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Paginated list of payments.', type: Pagination<Payment> }) // Note: type here should represent Paginated Payment
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<Pagination<Payment>> {
    limit = limit > 100 ? 100 : limit; // Cap limit
    return this.paymentsService.findAll({
      page,
      limit,
      route: '/payments',
    });
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get a payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Payment details.', type: Payment })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Update a payment' })
  @ApiParam({ name: 'id', description: 'Payment ID to update', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Payment updated successfully.', type: Payment })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePaymentDto: UpdatePaymentDto, @Req() req: Request) {
    const user = req.user as { id: string };
    return this.paymentsService.update(id, updatePaymentDto, user.id);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a payment' })
  @ApiParam({ name: 'id', description: 'Payment ID to delete', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Payment deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Payment not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.remove(id);
  }

  @Get('/admin/test')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Test endpoint for admin access' })
  @ApiResponse({ status: 200, description: 'Admin test successful' })
  adminTest() {
    return { message: 'Payments admin test endpoint successful' };
  }
} 