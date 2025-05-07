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
  SetMetadata,
} from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard, ROLES_KEY } from '../../core/guards/roles.guard';
import { RoleName } from '../roles/entities/role.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Equipment } from './entities/equipment.entity';

@ApiTags('Equipment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER])
  @ApiOperation({ summary: 'Create new equipment' })
  @ApiResponse({ status: 201, description: 'Equipment created successfully.', type: Equipment })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Conflict. Serial number might already exist.' })
  create(@Body() createEquipmentDto: CreateEquipmentDto): Promise<Equipment> {
    return this.equipmentService.create(createEquipmentDto);
  }

  @Get()
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER, RoleName.PHOTOGRAPHER])
  @ApiOperation({ summary: 'Get all equipment with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of equipment.', type: Pagination<Equipment> })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Pagination<Equipment>> {
    limit = limit > 100 ? 100 : limit;
    return this.equipmentService.findAll({ page, limit, route: '/api/equipment' });
  }

  @Get(':id')
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER, RoleName.PHOTOGRAPHER])
  @ApiOperation({ summary: 'Get equipment by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Equipment ID' })
  @ApiResponse({ status: 200, description: 'Equipment details.', type: Equipment })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Equipment> {
    return this.equipmentService.findOne(id);
  }

  @Patch(':id')
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER])
  @ApiOperation({ summary: 'Update equipment' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Equipment ID' })
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
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete equipment' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Equipment ID' })
  @ApiResponse({ status: 204, description: 'Equipment deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Equipment not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.equipmentService.remove(id);
  }
} 