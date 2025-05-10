import { Test, TestingModule } from '@nestjs/testing';
import { MemberEvaluationsController } from './member-evaluations.controller';
import { MemberEvaluationsService } from './member-evaluations.service';
import { CreateMemberEvaluationDto } from './dto/create-member-evaluation.dto';
import { UpdateMemberEvaluationDto } from './dto/update-member-evaluation.dto';
import { User } from '../users/entities/user.entity';
import { MemberEvaluation } from './entities/member-evaluation.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { ArgumentMetadata, ValidationPipe, BadRequestException } from '@nestjs/common';

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
    .overrideGuard(JwtAuthGuard).useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard).useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<MemberEvaluationsController>(MemberEvaluationsController);
    service = module.get<MemberEvaluationsService>(MemberEvaluationsService);
    
    // Clear mocks before each test in this describe block
    Object.values(mockMemberEvaluationsService).forEach(mockFn => mockFn.mockClear());
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
  
  describe('DTO Validation', () => {
    let validationPipe: ValidationPipe;

    beforeEach(() => {
      validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
        enableDebugMessages: true,
      });
    });

    it('CreateMemberEvaluationDto should pass validation with valid data', async () => {
      const validDto: CreateMemberEvaluationDto = {
        show_id: '123e4567-e89b-12d3-a456-426614174000',
        evaluated_user_id: '123e4567-e89b-12d3-a456-426614174001',
        rating: 8,
        comments: 'Valid comment'
      };
      const metadata: ArgumentMetadata = { type: 'body', metatype: CreateMemberEvaluationDto };
      await expect(validationPipe.transform(validDto, metadata)).resolves.toEqual(validDto);
    });

    it('CreateMemberEvaluationDto should pass with only mandatory fields', async () => {
      const validDtoMinimal: Partial<CreateMemberEvaluationDto> = {
        show_id: '123e4567-e89b-12d3-a456-426614174002',
        evaluated_user_id: '123e4567-e89b-12d3-a456-426614174003',
      };
      const metadata: ArgumentMetadata = { type: 'body', metatype: CreateMemberEvaluationDto };
      const result = await validationPipe.transform(validDtoMinimal as CreateMemberEvaluationDto, metadata);
      expect(result.show_id).toBe(validDtoMinimal.show_id);
      expect(result.evaluated_user_id).toBe(validDtoMinimal.evaluated_user_id);
      expect(result.hasOwnProperty('rating') ? result.rating : undefined).toBeUndefined();
      expect(result.hasOwnProperty('comments') ? result.comments : undefined).toBeUndefined();
    });

    it('CreateMemberEvaluationDto should pass with rating and comments as null (if DTO allows)', async () => {
      const validDtoWithNulls: CreateMemberEvaluationDto = {
        show_id: '123e4567-e89b-12d3-a456-426614174004',
        evaluated_user_id: '123e4567-e89b-12d3-a456-426614174005',
        rating: null,
        comments: null,
      };
      const metadata: ArgumentMetadata = { type: 'body', metatype: CreateMemberEvaluationDto };
      try {
        const result = await validationPipe.transform(validDtoWithNulls, metadata);
        expect(result.show_id).toEqual(validDtoWithNulls.show_id);
        expect(result.evaluated_user_id).toEqual(validDtoWithNulls.evaluated_user_id);
        expect(result.rating === null || result.rating === undefined).toBe(true);
        expect(result.comments === null || result.comments === undefined).toBe(true);
      } catch (errorCaught) {
        console.error('Error in test: CreateMemberEvaluationDto should pass with rating and comments as null', errorCaught);
        throw errorCaught;
      }
    });

    it('CreateMemberEvaluationDto should fail validation with invalid UUID for show_id and provide details', async () => {
      const invalidDto = {
        show_id: 'invalid-uuid',
        evaluated_user_id: '123e4567-e89b-12d3-a456-426614174006',
        rating: 8,
        comments: 'A comment'
      };
      const metadata: ArgumentMetadata = { type: 'body', metatype: CreateMemberEvaluationDto };
      try {
        await validationPipe.transform(invalidDto, metadata);
        throw new Error('ValidationPipe.transform did not throw an error as expected.');
      } catch (errorCaught) {
        expect(errorCaught).toBeInstanceOf(BadRequestException);
        const response = (errorCaught as BadRequestException).getResponse() as { message: string[] };
        expect(response.message).toContain('show_id must be a UUID');
      }
    });

    it('CreateMemberEvaluationDto should fail validation with rating out of range and provide details', async () => {
      const invalidDto: CreateMemberEvaluationDto = {
        show_id: '123e4567-e89b-12d3-a456-426614174007',
        evaluated_user_id: '123e4567-e89b-12d3-a456-426614174008',
        rating: 11,
        comments: "Valid comment"
      };
      const metadata: ArgumentMetadata = { type: 'body', metatype: CreateMemberEvaluationDto };
      try {
        await validationPipe.transform(invalidDto, metadata);
        throw new Error('ValidationPipe.transform did not throw an error as expected for out-of-range rating.');
      } catch (errorCaught) {
        expect(errorCaught).toBeInstanceOf(BadRequestException);
        const response = (errorCaught as BadRequestException).getResponse() as { message: string[] };
        expect(response.message).toEqual(expect.arrayContaining([expect.stringMatching(/rating must not be greater than 10|rating must be an integer number/i)]));
      }
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

      expect(await controller.findOne(evalId, mockRequest as any)).toBe(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(evalId, mockUser);
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
      mockMemberEvaluationsService.remove.mockResolvedValue(undefined);

      await controller.remove(evalIdToRemove, mockRequest as any);
      expect(service.remove).toHaveBeenCalledWith(evalIdToRemove, mockUser);
    });
  });
}); 