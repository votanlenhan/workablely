import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseUUIDPipe, HttpCode, HttpStatus, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { MemberEvaluationsService } from './member-evaluations.service';
import { CreateMemberEvaluationDto } from './dto/create-member-evaluation.dto';
import { UpdateMemberEvaluationDto } from './dto/update-member-evaluation.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { RoleName } from '../roles/entities/role-name.enum';
import { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
import { MemberEvaluation } from './entities/member-evaluation.entity';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

@ApiTags('Member Evaluations')
@ApiBearerAuth()
@Controller('member-evaluations')
export class MemberEvaluationsController {
  constructor(private readonly evaluationsService: MemberEvaluationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER) // Or any role that can evaluate
  @ApiOperation({ summary: 'Create a new member evaluation' })
  @ApiResponse({ status: 201, description: 'The evaluation has been successfully created.', type: MemberEvaluation })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  create(
    @Body() createDto: CreateMemberEvaluationDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<MemberEvaluation> {
    return this.evaluationsService.create(createDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER) // Added RoleName.USER
  @ApiOperation({ summary: 'Get all evaluations with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of evaluations', /* type: Pagination<MemberEvaluation> */ }) // Type should match service return
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAllPaginated(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Req() req: AuthenticatedRequest,
  ): Promise<Pagination<MemberEvaluation>> { // Adjust return type based on service
    const options: IPaginationOptions = { page, limit };
    // Add filtering by req.user if non-admins should only see their relevant evaluations
    return this.evaluationsService.findAllPaginated(options, req.user);
  }

  @Get('show/:showId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all evaluations for a specific show' })
  @ApiResponse({ status: 200, description: 'List of evaluations for the show', type: [MemberEvaluation] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAllByShow(@Param('showId', ParseUUIDPipe) showId: string): Promise<MemberEvaluation[]> {
    return this.evaluationsService.findAllByShow(showId);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all evaluations for a specific evaluated user' })
  @ApiResponse({ status: 200, description: 'List of evaluations for the user', type: [MemberEvaluation] })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAllByEvaluatedUser(@Param('userId', ParseUUIDPipe) userId: string): Promise<MemberEvaluation[]> {
    return this.evaluationsService.findAllByEvaluatedUser(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a specific evaluation by ID' })
  @ApiResponse({ status: 200, description: 'The found evaluation', type: MemberEvaluation })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Evaluation not found.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<MemberEvaluation> {
    return this.evaluationsService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER) // Or evaluator themselves (service checks this)
  @ApiOperation({ summary: 'Update an existing evaluation' })
  @ApiResponse({ status: 200, description: 'The evaluation has been successfully updated.', type: MemberEvaluation })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  @ApiResponse({ status: 404, description: 'Evaluation not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateMemberEvaluationDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<MemberEvaluation> {
    return this.evaluationsService.update(id, updateDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER) // Or evaluator themselves (service checks this)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an evaluation' })
  @ApiResponse({ status: 204, description: 'The evaluation has been successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden resource.' })
  @ApiResponse({ status: 404, description: 'Evaluation not found.' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.evaluationsService.remove(id, req.user);
  }
} 