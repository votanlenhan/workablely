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
  Req,
  SetMetadata,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ShowsService } from './shows.service';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Show } from './entities/show.entity';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/guards/roles.guard';
import { ApiOperation, ApiTags, ApiQuery, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ROLES_KEY } from '@/core/guards/roles.guard';
import { RoleName } from '../roles/entities/role.entity';

@ApiTags('Shows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shows')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ShowsController {
  constructor(private readonly showsService: ShowsService) {}

  @Post()
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER])
  @ApiOperation({ summary: 'Create a new show' })
  @ApiResponse({ status: 201, description: 'The show has been successfully created.', type: Show })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createShowDto: CreateShowDto, @Req() req: any): Promise<Show> {
    return this.showsService.create(createShowDto, req.user.id);
  }

  @Get()
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER, RoleName.PHOTOGRAPHER])
  @ApiOperation({ summary: 'Get all shows with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of shows.', type: Pagination<Show> })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<Pagination<Show>> {
    const finalPage = page ?? 1;
    let finalLimit = limit ?? 10;
    finalLimit = finalLimit > 100 ? 100 : finalLimit;

    return this.showsService.findAll({
      page: finalPage,
      limit: finalLimit,
      route: req.path,
    });
  }

  @Get(':id')
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER, RoleName.PHOTOGRAPHER])
  @ApiOperation({ summary: 'Get a show by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Show ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Show> {
    return this.showsService.findOne(id);
  }

  @Patch(':id')
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER])
  @ApiOperation({ summary: 'Update a show by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'Show ID' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShowDto: UpdateShowDto,
  ): Promise<Show> {
    return this.showsService.update(id, updateShowDto);
  }

  @Delete(':id')
  @SetMetadata(ROLES_KEY, [RoleName.ADMIN, RoleName.MANAGER])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a show by ID' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.showsService.remove(id);
  }
} 