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
import { EquipmentAssignmentsService } from './equipment-assignments.service';
import { CreateEquipmentAssignmentDto } from './dto/create-equipment-assignment.dto';
import { UpdateEquipmentAssignmentDto } from './dto/update-equipment-assignment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard, ROLES_KEY } from '../../core/guards/roles.guard';
import { RoleName } from '../roles/entities/role.entity';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
import { Pagination } from 'nestjs-typeorm-paginate';
import { EquipmentAssignment } from './entities/equipment-assignment.entity';

@ApiTags('Equipment Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('equipment-assignments')
export class EquipmentAssignmentsController {
  constructor(
    private readonly assignmentsService: EquipmentAssignmentsService,
  ) {}

  @Post()
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER])
  @ApiOperation({ summary: 'Create new equipment assignment [Admin, Manager Only]' })
  @ApiResponse({ status: 201, description: 'Assignment created.', type: EquipmentAssignment })
  @ApiResponse({ status: 400, description: 'Invalid input / Equipment not available.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Equipment, Show, or User not found.' })
  create(
    @Body() createDto: CreateEquipmentAssignmentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<EquipmentAssignment> {
    const assignerUserId = req.user.id;
    return this.assignmentsService.create(createDto, assignerUserId);
  }

  @Get()
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER, RoleName.PHOTOGRAPHER])
  @ApiOperation({ summary: 'Get all equipment assignments with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'equipment_id', required: false, type: String, format: 'uuid' })
  @ApiQuery({ name: 'show_id', required: false, type: String, format: 'uuid' })
  @ApiQuery({ name: 'assigned_to_user_id', required: false, type: String, format: 'uuid' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of assignments.', type: Pagination<EquipmentAssignment> /* Check Type */ })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('equipment_id') equipment_id?: string,
    @Query('show_id') show_id?: string,
    @Query('assigned_to_user_id') assigned_to_user_id?: string,
    @Query('status') status?: string,
  ): Promise<Pagination<EquipmentAssignment>> {
    limit = limit > 100 ? 100 : limit;
    return this.assignmentsService.findAll({ page, limit, route: '/api/equipment-assignments' }, { equipment_id, show_id, assigned_to_user_id, status });
  }

  @Get(':id')
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER, RoleName.PHOTOGRAPHER])
  @ApiOperation({ summary: 'Get equipment assignment by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Assignment details.', type: EquipmentAssignment })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Assignment not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<EquipmentAssignment> {
    return this.assignmentsService.findOne(id);
  }

  @Patch(':id')
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER])
  @ApiOperation({ summary: 'Update equipment assignment by ID [Admin, Manager Only]' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Assignment updated.', type: EquipmentAssignment })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Assignment, Equipment, Show or User not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEquipmentAssignmentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<EquipmentAssignment> {
    return this.assignmentsService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete equipment assignment by ID [Admin, Manager Only]' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Assignment deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Assignment not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.assignmentsService.remove(id);
  }
} 