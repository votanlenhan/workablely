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
import { RoleName } from '@/modules/roles/entities/role.entity';
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
  @ApiOperation({ summary: 'Get all show assignments (basic, no pagination yet)' })
  @ApiResponse({ status: 200, description: 'List of show assignments retrieved.', type: [ShowAssignment] })
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  async findAll(
  ): Promise<ShowAssignment[]> {
    return this.assignmentsService.findAll(/* Remove pagination options and filters */);
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