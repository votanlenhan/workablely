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
import { EquipmentAssignmentsService } from './equipment-assignments.service';
import { CreateEquipmentAssignmentDto } from './dto/create-equipment-assignment.dto';
import { UpdateEquipmentAssignmentDto } from './dto/update-equipment-assignment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/core/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/guards/roles.guard';
import { Roles } from '@/core/decorators/roles.decorator';
import { RoleName } from '@/modules/roles/entities/role.entity';
import { AuthenticatedRequest } from '@/core/interfaces/authenticated-request.interface';
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
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
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
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
  @ApiOperation({ summary: 'Get all equipment assignments with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of assignments.', type: Pagination<EquipmentAssignment> /* Check Type */ })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<Pagination<EquipmentAssignment>> {
    limit = limit > 100 ? 100 : limit;
    return this.assignmentsService.findAll({ page, limit, route: '/api/equipment-assignments' });
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
  @ApiOperation({ summary: 'Get equipment assignment by ID' })
  @ApiResponse({ status: 200, description: 'Assignment details.', type: EquipmentAssignment })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Assignment not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<EquipmentAssignment> {
    return this.assignmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Update equipment assignment by ID [Admin, Manager Only]' })
  @ApiResponse({ status: 200, description: 'Assignment updated.', type: EquipmentAssignment })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Assignment, Equipment, Show or User not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateEquipmentAssignmentDto,
  ): Promise<EquipmentAssignment> {
    return this.assignmentsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete equipment assignment by ID [Admin, Manager Only]' })
  @ApiResponse({ status: 204, description: 'Assignment deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Assignment not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.assignmentsService.remove(id);
  }
} 