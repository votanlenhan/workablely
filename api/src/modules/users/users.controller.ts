import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, PlainUser } from './entities/user.entity'; // Keep PlainUser for return types
import { Pagination } from 'nestjs-typeorm-paginate';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiHideProperty,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard, ROLES_KEY } from '@/core/guards/roles.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @SetMetadata(ROLES_KEY, ['Admin'])
  @ApiOperation({ summary: 'Create a new user [Admin Only]' })
  @ApiResponse({ status: 201, description: 'User created.', type: User })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 409, description: 'Conflict (Email exists).' })
  @HttpCode(HttpStatus.CREATED)
  // TODO: Add permission check (e.g., create User)
  create(@Body() createUserDto: CreateUserDto): Promise<PlainUser> {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Paginated list of users.', type: [User] })
  // TODO: Add permission check (e.g., read User)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<Pagination<PlainUser>> {
    limit = limit > 100 ? 100 : limit; // Cap limit
    // Assuming UsersService will have a findAll method supporting pagination
    return this.usersService.findAll({ page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'User details.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  // TODO: Add permission check (e.g., read User or read self)
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PlainUser> {
    // findOneById returns the full User object, we need to make sure service returns PlainUser or map it here
    // For now, assuming service handles returning PlainUser
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  @SetMetadata(ROLES_KEY, ['Admin'])
  @ApiOperation({ summary: 'Update user by ID [Admin Only]' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated.', type: User })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 409, description: 'Conflict (Email exists).' })
  // TODO: Add permission check (e.g., update User or update self)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<PlainUser> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @SetMetadata(ROLES_KEY, ['Admin'])
  @ApiOperation({ summary: 'Delete user by ID [Admin Only]' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'User deleted.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  // TODO: Add permission check (e.g., delete User)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.removeUser(id);
  }
}
