import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard, ROLES_KEY } from '@/core/guards/roles.guard';

@ApiTags('Roles & Permissions') // Group endpoints in Swagger UI
@Controller('roles') // Base path for all routes in this controller
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @SetMetadata(ROLES_KEY, ['Admin'])
  @ApiOperation({ summary: 'Create a new role [Admin Only]' })
  @ApiResponse({
    status: 201,
    description: 'The role has been successfully created.',
    type: Role,
  }) // Assuming Role entity can be returned directly or use a Response DTO
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., validation error, invalid permission ID)',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict (e.g., role name already exists)',
  })
  @HttpCode(HttpStatus.CREATED)
  // TODO: Add Permissions decorator later: @RequiredPermissions({ action: 'create', subject: 'Role' })
  create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number, example: 10 })
  @ApiQuery({ name: 'name', required: false, description: 'Filter by role name', type: String })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of roles with their permissions.',
    // TODO: Define a paginated response DTO for Swagger if needed
  })
  // TODO: Add Permissions decorator later: @RequiredPermissions({ action: 'read', subject: 'Role' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('name') name?: string,
  ): Promise<Pagination<Role>> {
    limit = limit > 100 ? 100 : limit; // Cap limit
    return this.rolesService.findAll({ page, limit, name });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific role by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Role ID',
  })
  @ApiResponse({ status: 200, description: 'The found role.', type: Role })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  // TODO: Add Permissions decorator later: @RequiredPermissions({ action: 'read', subject: 'Role' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Role> {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @SetMetadata(ROLES_KEY, ['Admin'])
  @ApiOperation({ summary: 'Update a role by ID [Admin Only]' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Role ID',
  })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({
    status: 200,
    description: 'The role has been successfully updated.',
    type: Role,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., validation error, invalid permission ID)',
  })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  @ApiResponse({
    status: 409,
    description: 'Conflict (e.g., role name already exists)',
  })
  // TODO: Add Permissions decorator later: @RequiredPermissions({ action: 'update', subject: 'Role' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @SetMetadata(ROLES_KEY, ['Admin'])
  @ApiOperation({ summary: 'Delete a role by ID [Admin Only]' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Role ID',
  })
  @ApiResponse({
    status: 204,
    description: 'The role has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  // TODO: Add Permissions decorator later: @RequiredPermissions({ action: 'delete', subject: 'Role' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.rolesService.remove(id);
  }
}
