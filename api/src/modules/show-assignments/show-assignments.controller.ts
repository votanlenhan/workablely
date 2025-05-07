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
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ShowAssignmentsService } from './show-assignments.service';
import { CreateShowAssignmentDto } from './dto/create-show-assignment.dto';
import { UpdateShowAssignmentDto } from './dto/update-show-assignment.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ShowAssignment } from './entities/show-assignment.entity';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/guards/roles.guard';
import { ApiOperation, ApiTags, ApiQuery, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Roles } from '@/core/decorators/roles.decorator';
import { RoleName } from '@/modules/roles/entities/role-name.enum';
import { Request } from 'express';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('Show Assignments')
@Controller('show-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class ShowAssignmentsController {
  constructor(private readonly assignmentsService: ShowAssignmentsService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Assign a user to a show role [Admin/Manager Only]' })
  @ApiResponse({ status: 201, description: 'Assignment created successfully.', type: ShowAssignment })
  @ApiResponse({ status: 400, description: 'Bad Request (Validation failed, invalid IDs)' })
  @ApiResponse({ status: 404, description: 'Show, User, or ShowRole not found.' })
  @ApiResponse({ status: 409, description: 'Conflict (User already assigned to this show).' })
  create(
    @Body() createDto: CreateShowAssignmentDto,
    @Req() req: Request,
  ): Promise<ShowAssignment> {
    const user = req.user as User;
    return this.assignmentsService.create(createDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all show assignments with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of show assignments retrieved.', type: Pagination })
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<Pagination<ShowAssignment>> {
    limit = limit > 100 ? 100 : limit; // Cap limit
    return this.assignmentsService.findAll({
      page,
      limit,
      route: '/show-assignments', // Adjust if your base route is different
    });
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get a specific show assignment by ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Assignment details.', type: ShowAssignment })
  @ApiResponse({ status: 404, description: 'Assignment not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ShowAssignment> {
    return this.assignmentsService.findOne(id);
  }

  @Get('show/:showId')
  @ApiOperation({ summary: 'Get all assignments for a specific show with pagination' })
  @ApiParam({ name: 'showId', type: String, format: 'uuid', description: 'The ID of the show' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of assignments for the show.', type: Pagination })
  @ApiResponse({ status: 404, description: 'Show not found.' })
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  async findAllByShowId(
    @Param('showId', ParseUUIDPipe) showId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<Pagination<ShowAssignment>> {
    limit = limit > 100 ? 100 : limit; 
    return this.assignmentsService.findAllByShowId(showId, {
      page,
      limit,
      route: `/show-assignments/show/${showId}` // Set correct route for pagination links
    });
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all assignments for a specific user with pagination' })
  @ApiParam({ name: 'userId', type: String, format: 'uuid', description: 'The ID of the user' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiResponse({ status: 200, description: 'Paginated list of assignments for the user.', type: Pagination })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  async findAllByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ): Promise<Pagination<ShowAssignment>> {
    limit = limit > 100 ? 100 : limit; 
    return this.assignmentsService.findAllByUserId(userId, {
      page,
      limit,
      route: `/show-assignments/user/${userId}` // Set correct route for pagination links
    });
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Update assignment status (confirm/decline) [Admin/Manager Only - For Now]' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Assignment updated successfully.', type: ShowAssignment })
  @ApiResponse({ status: 400, description: 'Bad Request (Validation failed)' })
  @ApiResponse({ status: 404, description: 'Assignment not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateShowAssignmentDto,
  ): Promise<ShowAssignment> {
    return this.assignmentsService.update(id, updateDto);
  }

  @Patch(':id/confirm')
  @Roles(RoleName.ADMIN, RoleName.MANAGER) // Or potentially the assigned user
  @ApiOperation({ summary: 'Confirm a show assignment [Admin/Manager or Assigned User]' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Assignment confirmed successfully.', type: ShowAssignment })
  @ApiResponse({ status: 404, description: 'Assignment not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden (If permission check is added)' })
  confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<ShowAssignment> {
    const user = req.user as User;
    return this.assignmentsService.confirm(id, user);
  }

  @Patch(':id/decline')
  @Roles(RoleName.ADMIN, RoleName.MANAGER) // Or potentially the assigned user
  @ApiOperation({ summary: 'Decline a show assignment [Admin/Manager or Assigned User]' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Assignment declined successfully.', type: ShowAssignment })
  @ApiResponse({ status: 400, description: 'Bad Request (Missing decline reason)' })
  @ApiResponse({ status: 404, description: 'Assignment not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden (If permission check is added)' })
  decline(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('decline_reason') declineReason: string, // Expect reason in body
    @Req() req: Request,
  ): Promise<ShowAssignment> {
    const user = req.user as User;
    return this.assignmentsService.decline(id, declineReason, user);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Delete a show assignment by ID [Admin/Manager Only]' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Assignment deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Assignment not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.assignmentsService.remove(id);
  }
} 