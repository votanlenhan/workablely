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
} from '@nestjs/common';
import { ShowsService } from './shows.service';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Show } from './entities/show.entity';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard, ROLES_KEY } from '@/core/guards/roles.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Shows')
@Controller('shows')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ShowsController {
  constructor(private readonly showsService: ShowsService) {}

  @Post()
  @SetMetadata(ROLES_KEY, ['Admin', 'Manager'])
  @ApiOperation({ summary: 'Create a new show [Admin/Manager Only]' })
  create(
    @Body() createShowDto: CreateShowDto,
    @Req() req: any,
  ): Promise<Show> {
    const creatorUserId: string | null = req.user?.id || null;
    return this.showsService.create(createShowDto, creatorUserId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shows with pagination' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number = 10,
  ): Promise<Pagination<Show>> {
    limit = limit > 100 ? 100 : limit;
    return this.showsService.findAll({
      page,
      limit,
      route: '/shows',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific show by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Show> {
    return this.showsService.findOne(id);
  }

  @Patch(':id')
  @SetMetadata(ROLES_KEY, ['Admin', 'Manager'])
  @ApiOperation({ summary: 'Update a show by ID [Admin/Manager Only]' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShowDto: UpdateShowDto,
  ): Promise<Show> {
    return this.showsService.update(id, updateShowDto);
  }

  @Delete(':id')
  @SetMetadata(ROLES_KEY, ['Admin', 'Manager'])
  @ApiOperation({ summary: 'Delete a show by ID [Admin/Manager Only]' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.showsService.remove(id);
  }

  @Post(':id/record-payment')
  @SetMetadata(ROLES_KEY, ['Admin', 'Manager'])
  @ApiOperation({ summary: 'Record a payment for a show [Admin/Manager Only]' })
  recordPayment(
      @Param('id', ParseUUIDPipe) id: string,
      @Body('amount', ParseIntPipe) amount: number
  ): Promise<Show> {
      return this.showsService.recordPayment(id, amount);
  }
} 