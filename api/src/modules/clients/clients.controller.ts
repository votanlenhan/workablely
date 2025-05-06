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
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Client } from './entities/client.entity';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard, ROLES_KEY } from '@/core/guards/roles.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @SetMetadata(ROLES_KEY, ['Admin', 'Manager'])
  @ApiOperation({ summary: 'Create a new client [Admin/Manager Only]' })
  create(@Body() createClientDto: CreateClientDto): Promise<Client> {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all clients with pagination' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number = 10,
  ): Promise<Pagination<Client>> {
    limit = limit > 100 ? 100 : limit; // Cap limit
    return this.clientsService.findAll({
      page,
      limit,
      route: '/clients', // Base route for pagination links
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific client by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Client> {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  @SetMetadata(ROLES_KEY, ['Admin', 'Manager'])
  @ApiOperation({ summary: 'Update a client by ID [Admin/Manager Only]' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<Client> {
    return this.clientsService.update(id, updateClientDto);
  }

  @Delete(':id')
  @SetMetadata(ROLES_KEY, ['Admin', 'Manager'])
  @ApiOperation({ summary: 'Delete a client by ID [Admin/Manager Only]' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.clientsService.remove(id);
  }
} 