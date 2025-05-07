import { Test, TestingModule } from '@nestjs/testing';
import { MemberEvaluationsController } from './member-evaluations.controller';
import { MemberEvaluationsService } from './member-evaluations.service';
import { CreateMemberEvaluationDto } from './dto/create-member-evaluation.dto';
import { UpdateMemberEvaluationDto } from './dto/update-member-evaluation.dto';
import { User } from '../users/entities/user.entity';
import { MemberEvaluation } from './entities/member-evaluation.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';

// Mock service
const mockMemberEvaluationsService = {
  create: jest.fn(),
  findAllByShow: jest.fn(),
  findAllByEvaluatedUser: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock user for AuthenticatedRequest
const mockUser = { id: 'user-uuid-req', email: 'req@example.com' } as User;
const mockRequest = { user: mockUser };

describe('MemberEvaluationsController', () => {
  let controller: MemberEvaluationsController;
  let service: MemberEvaluationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberEvaluationsController],
      providers: [
        { provide: MemberEvaluationsService, useValue: mockMemberEvaluationsService },
      ],
    })
    .overrideGuard(JwtAuthGuard).useValue({ canActivate: jest.fn(() => true) }) // Mock JwtAuthGuard
    .overrideGuard(RolesGuard).useValue({ canActivate: jest.fn(() => true) }) // Mock RolesGuard
    .compile();

    controller = module.get<MemberEvaluationsController>(MemberEvaluationsController);
    service = module.get<MemberEvaluationsService>(MemberEvaluationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an evaluation', async () => {
      const createDto: CreateMemberEvaluationDto = {
        show_id: 'show-uuid',
        evaluated_user_id: 'evaluated-user-uuid',
        rating: 5,
        comments: 'Good job'
      };
      const expectedResult = { ...createDto, id: 'eval-uuid' } as MemberEvaluation;
      mockMemberEvaluationsService.create.mockResolvedValue(expectedResult);

      expect(await controller.create(createDto, mockRequest as any)).toBe(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto, mockUser);
    });
  });
  
  // ValidationPipe for DTOs (example for one DTO, apply to others as needed)
  describe('DTO Validation', () => {
    let validationPipe: ValidationPipe;

    beforeEach(() => {
      validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true, // Strips properties that do not have any decorators
        forbidNonWhitelisted: true, // Throw an error if non-whitelisted values are provided
      });
    });

    it('CreateMemberEvaluationDto should pass validation with valid data', async () => {
      const validDto: CreateMemberEvaluationDto = {
        show_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        evaluated_user_id: 'b2c3d4e5-f678-9012-3456-7890abcdef01',
        rating: 8,
        comments: 'Valid comment'
      };
      const metadata: ArgumentMetadata = { type: 'body', metatype: CreateMemberEvaluationDto };
      await expect(validationPipe.transform(validDto, metadata)).resolves.toEqual(validDto);
    });

    it('CreateMemberEvaluationDto should pass with only mandatory fields', async () => {
      const validDtoMinimal: CreateMemberEvaluationDto = {
        show_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        evaluated_user_id: 'b2c3d4e5-f678-9012-3456-7890abcdef01',
      };
      const metadata: ArgumentMetadata = { type: 'body', metatype: CreateMemberEvaluationDto };
      await expect(validationPipe.transform(validDtoMinimal, metadata)).resolves.toEqual(validDtoMinimal);
    });

    it.skip('CreateMemberEvaluationDto should pass with rating and comments as null', async () => {
      const validDtoWithNulls: CreateMemberEvaluationDto = {
        show_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        evaluated_user_id: 'b2c3d4e5-f678-9012-3456-7890abcdef01',
        rating: null,
        comments: null,
      };
      const metadata: ArgumentMetadata = { type: 'body', metatype: CreateMemberEvaluationDto };
      await expect(validationPipe.transform(validDtoWithNulls, metadata)).resolves.toEqual(validDtoWithNulls);
    });

    it('CreateMemberEvaluationDto should fail validation with invalid UUID for show_id', async () => {
      const invalidDto = {
        show_id: 'invalid-uuid',
        evaluated_user_id: 'b2c3d4e5-f678-9012-3456-7890abcdef01',
        rating: 8,
      };
      const metadata: ArgumentMetadata = { type: 'body', metatype: CreateMemberEvaluationDto };
      await expect(validationPipe.transform(invalidDto, metadata)).rejects.toThrow();
    });

     it('CreateMemberEvaluationDto should fail validation with rating out of range', async () => {
      const invalidDto: CreateMemberEvaluationDto = {
        show_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        evaluated_user_id: 'b2c3d4e5-f678-9012-3456-7890abcdef01',
        rating: 11, // Invalid rating
      };
      const metadata: ArgumentMetadata = { type: 'body', metatype: CreateMemberEvaluationDto };
      await expect(validationPipe.transform(invalidDto, metadata)).rejects.toThrow();
    });
  });

  describe('findAllByShow', () => {
    it('should return an array of evaluations for a given showId', async () => {
      const showId = 'some-show-id';
      const expectedResult = [{ id: 'eval1' }, { id: 'eval2' }] as MemberEvaluation[];
      mockMemberEvaluationsService.findAllByShow.mockResolvedValue(expectedResult);

      expect(await controller.findAllByShow(showId)).toBe(expectedResult);
      expect(service.findAllByShow).toHaveBeenCalledWith(showId);
    });
  });

  describe('findAllByEvaluatedUser', () => {
    it('should return an array of evaluations for a given evaluatedUserId', async () => {
      const userId = 'some-user-id';
      const expectedResult = [{ id: 'eval3' }, { id: 'eval4' }] as MemberEvaluation[];
      mockMemberEvaluationsService.findAllByEvaluatedUser.mockResolvedValue(expectedResult);

      expect(await controller.findAllByEvaluatedUser(userId)).toBe(expectedResult);
      expect(service.findAllByEvaluatedUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOne', () => {
    it('should return a single evaluation', async () => {
      const evalId = 'eval-uuid-to-find';
      const expectedResult = { id: evalId, comments: 'Test findOne' } as MemberEvaluation;
      mockMemberEvaluationsService.findOne.mockResolvedValue(expectedResult);

      expect(await controller.findOne(evalId)).toBe(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(evalId);
    });
  });

  describe('update', () => {
    it('should update an evaluation', async () => {
      const evalIdToUpdate = 'eval-uuid-to-update';
      const updateDto: UpdateMemberEvaluationDto = { comments: 'Updated comment' };
      const expectedResult = { id: evalIdToUpdate, ...updateDto } as MemberEvaluation;
      mockMemberEvaluationsService.update.mockResolvedValue(expectedResult);

      expect(await controller.update(evalIdToUpdate, updateDto, mockRequest as any)).toBe(expectedResult);
      expect(service.update).toHaveBeenCalledWith(evalIdToUpdate, updateDto, mockUser);
    });
  });

  describe('remove', () => {
    it('should remove an evaluation', async () => {
      const evalIdToRemove = 'eval-uuid-to-remove';
      // remove service method doesn't return anything, so mockResolvedValue(undefined)
      mockMemberEvaluationsService.remove.mockResolvedValue(undefined);

      await controller.remove(evalIdToRemove, mockRequest as any);
      expect(service.remove).toHaveBeenCalledWith(evalIdToRemove, mockUser);
    });
  });
}); 