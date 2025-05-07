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
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/core/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/guards/roles.guard';
import { Roles } from '@/core/decorators/roles.decorator';
import { RoleName } from '@/modules/roles/entities/role.entity'; // Assuming RoleName enum exists
import { Pagination } from 'nestjs-typeorm-paginate';
import { Equipment } from './entities/equipment.entity';

@ApiTags('Equipment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Create new equipment [Admin, Manager Only]' })
  @ApiResponse({ status: 201, description: 'Equipment created successfully.', type: Equipment })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Conflict. Serial number might already exist.' })
  create(@Body() createEquipmentDto: CreateEquipmentDto): Promise<Equipment> {
    return this.equipmentService.create(createEquipmentDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER) // Or adjust as per who can view equipment
  @ApiOperation({ summary: 'Get all equipment with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of equipment.', type: Pagination<Equipment> /* Check this type */ })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Pagination<Equipment>> {
    limit = limit > 100 ? 100 : limit; // Cap limit
    return this.equipmentService.findAll({ page, limit, route: '/api/equipment' });
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
  @ApiOperation({ summary: 'Get equipment by ID' })
  @ApiResponse({ status: 200, description: 'Equipment details.', type: Equipment })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Equipment> {
    return this.equipmentService.findOne(id, { relations: ['assignments'] }); // Optionally load assignments
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Update equipment by ID [Admin, Manager Only]' })
  @ApiResponse({ status: 200, description: 'Equipment updated successfully.', type: Equipment })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  @ApiResponse({ status: 409, description: 'Conflict. Serial number might already exist.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ): Promise<Equipment> {
    return this.equipmentService.update(id, updateEquipmentDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete equipment by ID [Admin, Manager Only]' })
  @ApiResponse({ status: 204, description: 'Equipment deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.equipmentService.remove(id);
  }
} 