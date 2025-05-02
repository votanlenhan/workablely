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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Roles & Permissions') // Group endpoints in Swagger UI with Roles
@Controller('permissions') // Base path for all routes
// TODO: Add AuthGuard and appropriate PermissionsGuard later
// @UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({
    status: 201,
    description: 'The permission has been successfully created.',
    type: Permission,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., validation error)',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict (e.g., permission already exists)',
  })
  @HttpCode(HttpStatus.CREATED)
  // TODO: Add Permissions decorator later: @RequiredPermissions({ action: 'create', subject: 'Permission' })
  create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({
    status: 200,
    description: 'List of all permissions.',
    type: [Permission],
  })
  // TODO: Add Permissions decorator later: @RequiredPermissions({ action: 'read', subject: 'Permission' })
  findAll(): Promise<Permission[]> {
    return this.permissionsService.findAll();
    // TODO: Consider adding pagination later
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific permission by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Permission ID',
  })
  @ApiResponse({
    status: 200,
    description: 'The found permission.',
    type: Permission,
  })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  // TODO: Add Permissions decorator later: @RequiredPermissions({ action: 'read', subject: 'Permission' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Permission> {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a permission description by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Permission ID',
  })
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({
    status: 200,
    description: 'The permission has been successfully updated.',
    type: Permission,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request (e.g., validation error)',
  })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  // TODO: Add Permissions decorator later: @RequiredPermissions({ action: 'update', subject: 'Permission' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a permission by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Permission ID',
  })
  @ApiResponse({
    status: 204,
    description: 'The permission has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Permission not found.' })
  // TODO: Add Permissions decorator later: @RequiredPermissions({ action: 'delete', subject: 'Permission' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.permissionsService.remove(id);
  }
}
