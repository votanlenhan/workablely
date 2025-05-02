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
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Roles & Permissions') // Group endpoints in Swagger UI
@Controller('roles') // Base path for all routes in this controller
// TODO: Add AuthGuard and RolesGuard/PermissionsGuard later
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
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
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'List of all roles.', type: [Role] }) // Type array
  // TODO: Add Permissions decorator later: @RequiredPermissions({ action: 'read', subject: 'Role' })
  findAll(): Promise<Role[]> {
    return this.rolesService.findAll();
    // TODO: Consider adding pagination later if the list grows large
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
  @ApiOperation({ summary: 'Update a role by ID' })
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
  @ApiOperation({ summary: 'Delete a role by ID' })
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
