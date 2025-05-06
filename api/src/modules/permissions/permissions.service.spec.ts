import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';

import { PermissionsService } from './permissions.service';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Role } from '../roles/entities/role.entity'; // Import Role for Permission entity relation

// Mock the paginate function
jest.mock('nestjs-typeorm-paginate');
const mockPaginate = paginate as jest.Mock;

// --- Define Mock Repository Type ---
// We mock the methods used by the service
type MockRepository<T = any> = {
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  preload: jest.Mock;
  delete: jest.Mock;
  findBy: jest.Mock;
  createQueryBuilder: jest.Mock;
};

// --- Mock Factory for Repository ---
const repositoryMockFactory: () => MockRepository<Permission> = jest.fn(() => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
  findBy: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
  }),
}));

// Helper to create mock Permission object
const createMockPermission = (overrides: Partial<Permission> = {}): Permission => ({
  id: 'default-perm-id',
  action: 'default_action',
  subject: 'default_subject',
  description: null,
  created_at: new Date(),
  updated_at: new Date(),
  roles: [], // Add roles relation
  rolePermissions: [], // Add junction table relation if needed by tests
  ...overrides,
} as Permission);

describe('PermissionsService', () => {
  let service: PermissionsService;
  let repository: MockRepository<Permission>; // Use the defined mock type

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: getRepositoryToken(Permission),
          // Use the factory for consistent mock creation
          useFactory: repositoryMockFactory, 
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    // Get the mocked repository instance
    repository = module.get(getRepositoryToken(Permission));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Test Cases for create() ---
  describe('create', () => {
    const createDto: CreatePermissionDto = {
      action: 'read',
      subject: 'Post',
      description: 'Read posts',
    };
    const createdPermission = createMockPermission({ id: 'uuid-1', ...createDto });

    it('should create a new permission successfully', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(createdPermission); 
      repository.save.mockResolvedValue(createdPermission); 

      const result = await service.create(createDto);

      expect(result).toEqual(createdPermission);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { action: createDto.action, subject: createDto.subject },
      });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(createdPermission);
    });

    it('should throw ConflictException if permission already exists', async () => {
      repository.findOne.mockResolvedValue(createdPermission);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { action: createDto.action, subject: createDto.subject },
      });
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw ConflictException on unique constraint violation during save', async () => {
      repository.findOne.mockResolvedValue(null); 
      repository.create.mockReturnValue(createdPermission);
      repository.save.mockRejectedValue({ code: '23505' }); 

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(repository.save).toHaveBeenCalledWith(createdPermission);
    });

    it('should throw InternalServerErrorException for other save errors', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(createdPermission);
      repository.save.mockRejectedValue(new Error('Some other DB error'));

      await expect(service.create(createDto)).rejects.toThrow(InternalServerErrorException);
       expect(repository.save).toHaveBeenCalledWith(createdPermission);
    });
  });

  // --- Test Cases for findAll() ---
  describe('findAll', () => {
    const paginationOptions = { page: 1, limit: 10 };
    const mockPermissions = [
      createMockPermission({ id: 'uuid-1', action: 'read', subject: 'Post' }),
      createMockPermission({ id: 'uuid-2', action: 'create', subject: 'Post' }),
    ];
    const mockPaginationResult = {
      items: mockPermissions,
      meta: { totalItems: 2, itemCount: 2, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
      links: { first: '', previous: '', next: '', last: '' },
    };

    it('should return paginated permissions', async () => {
      // Get the mock query builder instance
      const queryBuilderMock = repository.createQueryBuilder();
      mockPaginate.mockResolvedValue(mockPaginationResult);

      const result = await service.findAll(paginationOptions);

      expect(result).toEqual(mockPaginationResult);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('permission');
      expect(queryBuilderMock.orderBy).toHaveBeenCalledWith('permission.subject', 'ASC');
      expect(queryBuilderMock.addOrderBy).toHaveBeenCalledWith('permission.action', 'ASC');
      expect(mockPaginate).toHaveBeenCalledWith(queryBuilderMock, paginationOptions);
    });
  });

  // --- Test Cases for findOne() ---
  describe('findOne', () => {
    const permissionId = 'uuid-test-1';
    const mockPermission = createMockPermission({ id: permissionId, action: 'manage', subject: 'all' });

    it('should return a permission if found', async () => {
      repository.findOne.mockResolvedValue(mockPermission);
      const result = await service.findOne(permissionId);
      expect(result).toEqual(mockPermission);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: permissionId } });
    });

    it('should throw NotFoundException if permission is not found', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.findOne(permissionId)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: permissionId } });
    });
  });

  // --- Test Cases for update() ---
  describe('update', () => {
    const permissionId = 'uuid-test-update';
    const updateDto: UpdatePermissionDto = {
      description: 'Updated description',
    };
    const existingPermission = createMockPermission({ 
        id: permissionId, 
        action: 'read', 
        subject: 'User',
        description: 'Old description'
    });
    const updatedPermissionData = { // Data passed to preload/save
        id: permissionId,
        ...updateDto, 
    };
    const savedPermission = createMockPermission({ // Result after save
        ...existingPermission, 
        ...updateDto, 
        updated_at: new Date() // Simulate update
    });

    it('should update the permission description successfully', async () => {
      // Mock preload to return the *merged* data before save
      repository.preload.mockResolvedValue(createMockPermission(updatedPermissionData)); 
      repository.save.mockResolvedValue(savedPermission); // Mock save returning final state

      const result = await service.update(permissionId, updateDto);

      expect(result).toEqual(savedPermission);
      expect(repository.preload).toHaveBeenCalledWith(updatedPermissionData);
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(updatedPermissionData));
    });

    it('should throw NotFoundException if permission to update is not found', async () => {
      repository.preload.mockResolvedValue(null); 

      await expect(service.update(permissionId, updateDto)).rejects.toThrow(NotFoundException);
      expect(repository.preload).toHaveBeenCalledWith(updatedPermissionData);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on save error during update', async () => {
        const preloadedData = createMockPermission(updatedPermissionData);
        repository.preload.mockResolvedValue(preloadedData);
        repository.save.mockRejectedValue(new Error('DB save error'));

        await expect(service.update(permissionId, updateDto)).rejects.toThrow(InternalServerErrorException);
        expect(repository.preload).toHaveBeenCalledWith(updatedPermissionData);
        expect(repository.save).toHaveBeenCalledWith(preloadedData);
    });
  });

  // --- Test Cases for remove() ---
  describe('remove', () => {
    const permissionId = 'uuid-test-remove';

    it('should remove the permission successfully', async () => {
      repository.delete.mockResolvedValue({ affected: 1, raw: [] });
      await service.remove(permissionId);
      expect(repository.delete).toHaveBeenCalledWith(permissionId);
    });

    it('should throw NotFoundException if permission to remove is not found', async () => {
      repository.delete.mockResolvedValue({ affected: 0, raw: [] });
      await expect(service.remove(permissionId)).rejects.toThrow(NotFoundException);
      expect(repository.delete).toHaveBeenCalledWith(permissionId);
    });

    it('should allow InternalServerErrorException to propagate if delete fails unexpectedly', async () => {
        repository.delete.mockRejectedValue(new InternalServerErrorException('DB delete failed'));
        await expect(service.remove(permissionId)).rejects.toThrow(InternalServerErrorException);
        expect(repository.delete).toHaveBeenCalledWith(permissionId);
    });
  });
}); 