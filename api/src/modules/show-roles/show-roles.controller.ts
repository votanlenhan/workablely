import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { ShowRolesService } from './show-roles.service';
import { CreateShowRoleDto } from './dto/create-show-role.dto';
import { UpdateShowRoleDto } from './dto/update-show-role.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ShowRole } from './entities/show-role.entity';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard, ROLES_KEY } from '@/core/guards/roles.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Show Roles')
@Controller('show-roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ShowRolesController {
  constructor(private readonly showRolesService: ShowRolesService) {}

  @Post()
  @SetMetadata(ROLES_KEY, ['Admin'])
  @ApiOperation({ summary: 'Create a new show role [Admin Only]' })
  create(@Body() createShowRoleDto: CreateShowRoleDto): Promise<ShowRole> {
    return this.showRolesService.create(createShowRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all show roles with pagination' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number = 10,
  ): Promise<Pagination<ShowRole>> {
    limit = limit > 100 ? 100 : limit; // Cap limit
    return this.showRolesService.findAll({
      page,
      limit,
      route: '/show-roles', // Base route for pagination links
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific show role by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ShowRole> {
    return this.showRolesService.findOne(id);
  }

  @Patch(':id')
  @SetMetadata(ROLES_KEY, ['Admin'])
  @ApiOperation({ summary: 'Update a show role by ID [Admin Only]' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShowRoleDto: UpdateShowRoleDto,
  ): Promise<ShowRole> {
    return this.showRolesService.update(id, updateShowRoleDto);
  }

  @Delete(':id')
  @SetMetadata(ROLES_KEY, ['Admin'])
  @ApiOperation({ summary: 'Delete a show role by ID [Admin Only]' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.showRolesService.remove(id);
  }
} 