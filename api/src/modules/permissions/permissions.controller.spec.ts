import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
import {
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/guards/roles.guard';
import { Pagination } from 'nestjs-typeorm-paginate';

// Mock Service Type Helper - Remove Partial as we define all methods
type MockPermissionsService = Record<keyof PermissionsService, jest.Mock>;

// Use correct service method names
const createMockPermissionsService = (): MockPermissionsService => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let mockPermissionsService: MockPermissionsService;

  // Basic mock permission for reuse
  const mockPermission: Permission = {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    action: 'read', // Use correct property name: action
    subject: 'posts', // Use correct property name: subject
    description: 'Can read posts',
    created_at: new Date(),
    updated_at: new Date(),
    roles: [], // Assume empty relation for basic tests
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: PermissionsService,
          useValue: createMockPermissionsService(),
        },
      ],
    })
      // Mock Guards - assuming all tests run as authenticated admin for simplicity
      // Adjust if specific role/permission checks are needed per test
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<PermissionsController>(PermissionsController);
    mockPermissionsService = module.get(PermissionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Test Cases for create() ---
  describe('create', () => {
    const createDto: CreatePermissionDto = {
      action: 'write', // Use correct property name: action
      subject: 'posts', // Use correct property name: subject
      description: 'Can write posts',
    };
    const createdPermission = { ...mockPermission, ...createDto, id: 'new-uuid' };

    it('should create a permission successfully', async () => {
      mockPermissionsService.create.mockResolvedValue(createdPermission);
      const result = await controller.create(createDto);
      expect(result).toEqual(createdPermission);
      expect(mockPermissionsService.create).toHaveBeenCalledWith(createDto);
    });

    it('should handle conflict exceptions during creation', async () => {
      mockPermissionsService.create.mockRejectedValue(new ConflictException());
      await expect(controller.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    // Add tests for validation errors if necessary
  });

  // --- Test Cases for findAll() ---
  describe('findAll', () => {
    it('should return paginated permissions', async () => {
      const page = 1;
      const limit = 5;
      const paginatedResult: Pagination<Permission> = {
        items: [mockPermission],
        meta: { totalItems: 1, itemCount: 1, itemsPerPage: limit, totalPages: 1, currentPage: page },
        links: { first: '', previous: '', next: '', last: '' }, // Mock links if structure is important
      };
      mockPermissionsService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(page, limit);
      expect(result).toEqual(paginatedResult);
      expect(mockPermissionsService.findAll).toHaveBeenCalledWith({ page, limit });
    });

    it('should handle errors during findAll', async () => {
      mockPermissionsService.findAll.mockRejectedValue(new InternalServerErrorException());
      await expect(controller.findAll(1, 10)).rejects.toThrow(InternalServerErrorException);
    });
    // Add tests for limit capping if desired
  });

  // --- Test Cases for findOne() ---
  describe('findOne', () => {
    const permissionId = mockPermission.id;

    it('should return a permission by id', async () => {
      mockPermissionsService.findOne.mockResolvedValue(mockPermission);
      const result = await controller.findOne(permissionId);
      expect(result).toEqual(mockPermission);
      expect(mockPermissionsService.findOne).toHaveBeenCalledWith(permissionId);
    });

    it('should throw NotFoundException if permission not found', async () => {
      const nonExistentId = 'non-existent-uuid';
      mockPermissionsService.findOne.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne(nonExistentId)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Test Cases for update() ---
  describe('update', () => {
    const permissionId = mockPermission.id;
    const updateDto: UpdatePermissionDto = { description: 'Updated description' };
    const updatedPermission = { ...mockPermission, ...updateDto };

    it('should update a permission successfully', async () => {
      mockPermissionsService.update.mockResolvedValue(updatedPermission);
      const result = await controller.update(permissionId, updateDto);
      expect(result).toEqual(updatedPermission);
      expect(mockPermissionsService.update).toHaveBeenCalledWith(permissionId, updateDto);
    });

    it('should throw NotFoundException if permission to update not found', async () => {
      const nonExistentId = 'non-existent-uuid';
      mockPermissionsService.update.mockRejectedValue(new NotFoundException());
      await expect(controller.update(nonExistentId, updateDto)).rejects.toThrow(NotFoundException);
    });
    // Add tests for validation errors if necessary
  });

  // --- Test Cases for remove() ---
  describe('remove', () => {
    const permissionId = mockPermission.id;

    it('should remove a permission successfully', async () => {
      mockPermissionsService.remove.mockResolvedValue(undefined); // remove returns Promise<void>
      await controller.remove(permissionId);
      // Use expect(...).resolves.toBeUndefined() or check call
      expect(mockPermissionsService.remove).toHaveBeenCalledWith(permissionId);
    });

    it('should throw NotFoundException if permission to remove not found', async () => {
      const nonExistentId = 'non-existent-uuid';
      mockPermissionsService.remove.mockRejectedValue(new NotFoundException());
      await expect(controller.remove(nonExistentId)).rejects.toThrow(NotFoundException);
    });
  });
}); 