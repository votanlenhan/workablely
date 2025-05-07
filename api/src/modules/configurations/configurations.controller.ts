import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
  SetMetadata,
} from '@nestjs/common';
import { ConfigurationsService } from './configurations.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
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
import { Configuration } from './entities/configuration.entity';
import { Pagination } from 'nestjs-typeorm-paginate';

@ApiTags('Configurations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('configurations')
export class ConfigurationsController {
  constructor(private readonly configurationsService: ConfigurationsService) {}

  @Post()
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN])
  @ApiOperation({ summary: 'Create a new configuration [Admin Only]' })
  @ApiResponse({ status: 201, description: 'Configuration created.', type: Configuration })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 409, description: 'Conflict. Key already exists.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createConfigurationDto: CreateConfigurationDto): Promise<Configuration> {
    return this.configurationsService.create(createConfigurationDto);
  }

  @Get()
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER]) // Or broader if some configs are public
  @ApiOperation({ summary: 'Get all configurations with pagination [Admin, Manager]' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Paginated list of configurations.', type: Pagination<Configuration> })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<Pagination<Configuration>> {
    limit = limit > 100 ? 100 : limit; // Cap limit
    return this.configurationsService.findAll({ page, limit, route: 'configurations' });
  }

  @Get('key/:key')
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER]) // Or broader if needed
  @ApiOperation({ summary: 'Get configuration by key [Admin, Manager]' })
  @ApiParam({ name: 'key', type: String })
  @ApiResponse({ status: 200, description: 'Configuration details.', type: Configuration })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Configuration not found.' })
  findOneByKey(@Param('key') key: string): Promise<Configuration> {
    return this.configurationsService.findOneByKey(key);
  }
  
  @Get(':id')
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER]) 
  @ApiOperation({ summary: 'Get configuration by ID [Admin, Manager]' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Configuration details.', type: Configuration })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Configuration not found.' })
  findOneById(@Param('id', ParseUUIDPipe) id: string): Promise<Configuration> {
    return this.configurationsService.findOneById(id);
  }

  @Patch(':id')
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN])
  @ApiOperation({ summary: 'Update configuration by ID [Admin Only]' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Configuration updated.', type: Configuration })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Configuration not found.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateConfigurationDto: UpdateConfigurationDto,
  ): Promise<Configuration> {
    // Additional check: ensure non-editable fields are not updated by non-admins if that logic is ever needed.
    // For now, only Admins can update, and they can update editable fields.
    // If a config item is_editable = false, the service should ideally prevent updates to 'value' or 'value_type'.
    // This logic could be in the service layer for stricter control.
    const config = await this.configurationsService.findOneById(id);
    if (!config.is_editable) {
        // For now, let's assume admins can override this. 
        // If not, throw ForbiddenException or BadRequestException.
        // Consider if an admin should be able to change `is_editable` itself.
    }
    return this.configurationsService.update(id, updateConfigurationDto);
  }

  @Delete(':id')
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN])
  @ApiOperation({ summary: 'Delete configuration by ID [Admin Only]' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Configuration deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Configuration not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.configurationsService.remove(id);
  }
} 