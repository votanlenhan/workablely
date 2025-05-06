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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
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

@ApiTags('Roles & Permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @SetMetadata(ROLES_KEY, ['Admin'])
  @ApiOperation({ summary: 'Create a new permission [Admin Only]' })
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
  create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of permissions.',
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<Pagination<Permission>> {
    limit = limit > 100 ? 100 : limit;
    return this.permissionsService.findAll({ page, limit });
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
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Permission> {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @SetMetadata(ROLES_KEY, ['Admin'])
  @ApiOperation({ summary: 'Update a permission description by ID [Admin Only]' })
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @SetMetadata(ROLES_KEY, ['Admin'])
  @ApiOperation({ summary: 'Delete a permission by ID [Admin Only]' })
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
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.permissionsService.remove(id);
  }
}
