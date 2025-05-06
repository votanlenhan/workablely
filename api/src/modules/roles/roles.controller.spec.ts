import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role, RoleName } from './entities/role.entity';
import { Permission } from '@/modules/permissions/entities/permission.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import {
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/guards/roles.guard';

// Mock Service Type Helper - Define explicit required mock methods
type MockRolesService = {
  create: jest.Mock;
  findAll: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
  // Add findOneByName if it were used by the controller and mocked
};

const createMockRolesService = (): MockRolesService => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('RolesController', () => {
  let controller: RolesController;
  let mockRolesService: MockRolesService;

  // Basic mock role/permission for reuse
  const mockPermission: Permission = {
    id: 'p1', action: 'read', subject: 'test',
    created_at: new Date(), updated_at: new Date(), roles: [],
  };
  const mockRole: Role = {
    id: 'r1',
    name: 'Tester',
    description: 'Test Role',
    is_system_role: false,
    created_at: new Date(),
    updated_at: new Date(),
    users: [],
    permissions: [mockPermission],
    // No deleted_at needed
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          // Use useValue with the created mock object
          useValue: createMockRolesService(),
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<RolesController>(RolesController);
    mockRolesService = module.get(RolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Test Cases for create() ---
  describe('create', () => {
    const createDto: CreateRoleDto = {
      name: 'NewRole',
      description: 'A new role',
      permissionIds: [mockPermission.id],
    };
    const createdRole = { ...mockRole, ...createDto, id: 'new-r-uuid' };

    it('should create a role successfully', async () => {
      mockRolesService.create.mockResolvedValue(createdRole);
      const result = await controller.create(createDto);
      expect(result).toEqual(createdRole);
      expect(mockRolesService.create).toHaveBeenCalledWith(createDto);
    });

    it('should handle conflict exceptions', async () => {
      mockRolesService.create.mockRejectedValue(new ConflictException());
      await expect(controller.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should handle permission not found exceptions', async () => {
      mockRolesService.create.mockRejectedValue(new NotFoundException());
      await expect(controller.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Test Cases for findAll() ---
  describe('findAll', () => {
    it('should return paginated roles', async () => {
      const page = 1;
      const limit = 5;
      const paginatedResult: Pagination<Role> = {
        items: [mockRole],
        meta: { totalItems: 1, itemCount: 1, itemsPerPage: limit, totalPages: 1, currentPage: page },
        links: { first: '', previous: '', next: '', last: '' },
      };
      mockRolesService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(page, limit);
      expect(result).toEqual(paginatedResult);
      expect(mockRolesService.findAll).toHaveBeenCalledWith({ page, limit });
    });

    it('should handle errors during findAll', async () => {
      mockRolesService.findAll.mockRejectedValue(new InternalServerErrorException());
      await expect(controller.findAll(1, 10)).rejects.toThrow(InternalServerErrorException);
    });
  });

  // --- Test Cases for findOne() ---
  describe('findOne', () => {
    const roleId = mockRole.id;

    it('should return a role by id', async () => {
      mockRolesService.findOne.mockResolvedValue(mockRole);
      const result = await controller.findOne(roleId);
      expect(result).toEqual(mockRole);
      expect(mockRolesService.findOne).toHaveBeenCalledWith(roleId);
    });

    it('should throw NotFoundException if role not found', async () => {
      const nonExistentId = 'non-existent-uuid';
      mockRolesService.findOne.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne(nonExistentId)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Test Cases for update() ---
  describe('update', () => {
    const roleId = mockRole.id;
    const updateDto: UpdateRoleDto = { description: 'Updated description' };
    const updatedRole = { ...mockRole, ...updateDto };

    it('should update a role successfully', async () => {
      mockRolesService.update.mockResolvedValue(updatedRole);
      const result = await controller.update(roleId, updateDto);
      expect(result).toEqual(updatedRole);
      expect(mockRolesService.update).toHaveBeenCalledWith(roleId, updateDto);
    });

    it('should throw NotFoundException if role to update not found', async () => {
      const nonExistentId = 'non-existent-uuid';
      mockRolesService.update.mockRejectedValue(new NotFoundException());
      await expect(controller.update(nonExistentId, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should handle conflict exceptions on update', async () => {
        mockRolesService.update.mockRejectedValue(new ConflictException());
        await expect(controller.update(roleId, updateDto)).rejects.toThrow(ConflictException);
    });
  });

  // --- Test Cases for remove() ---
  describe('remove', () => {
    const roleId = mockRole.id;

    it('should remove a role successfully', async () => {
      mockRolesService.remove.mockResolvedValue(undefined);
      await controller.remove(roleId);
      expect(mockRolesService.remove).toHaveBeenCalledWith(roleId);
    });

    it('should throw NotFoundException if role to remove not found', async () => {
      const nonExistentId = 'non-existent-uuid';
      mockRolesService.remove.mockRejectedValue(new NotFoundException());
      await expect(controller.remove(nonExistentId)).rejects.toThrow(NotFoundException);
    });
  });
}); 