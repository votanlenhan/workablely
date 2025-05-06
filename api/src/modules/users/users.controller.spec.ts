import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto';
import { User, PlainUser } from '@/modules/users/entities/user.entity';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Role, RoleName } from '@/modules/roles/entities/role.entity';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/core/guards/roles.guard';

// Mock Service Type Helper
type MockUsersService = {
  createUser: jest.Mock;
  findAll: jest.Mock;
  findOneById: jest.Mock;
  updateUser: jest.Mock;
  removeUser: jest.Mock;
  assignRole: jest.Mock;
  removeRole: jest.Mock;
};

const createMockUsersService = (): MockUsersService => ({
  createUser: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  updateUser: jest.fn(),
  removeUser: jest.fn(),
  assignRole: jest.fn(),
  removeRole: jest.fn(),
});

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: MockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useFactory: createMockUsersService },
      ],
    })
    .overrideGuard(JwtAuthGuard).useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard).useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<UsersController>(UsersController);
    mockUsersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Test Cases for createUser() ---
  describe('create', () => {
    it('should create a user successfully', async () => {
      const createDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
      };
      const expectedUser: PlainUser = {
        id: 'uuid-1',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        is_active: true,
        roles: [],
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockUsersService.createUser.mockResolvedValue(expectedUser);

      const result = await controller.create(createDto);
      expect(result).toEqual(expectedUser);
      expect(mockUsersService.createUser).toHaveBeenCalledWith(createDto);
    });

    it('should throw ForbiddenException if user creation is forbidden', async () => {
      const createDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
      };
      mockUsersService.createUser.mockRejectedValue(new ForbiddenException());
      await expect(controller.create(createDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // --- Test Cases for findAll() ---
  describe('findAll', () => {
    const user1: Partial<PlainUser> = { id: 'u1', email: 'a@test.com' }; // Use PlainUser type
    const paginatedResult: Pagination<PlainUser> = {
      items: [user1 as PlainUser],
      meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
      links: { first: '', previous: '', next: '', last: '' }
    };

    it('should call service.findAll with pagination options and return the result', async () => {
      mockUsersService.findAll.mockResolvedValue(paginatedResult);
      const page = 1;
      const limit = 10;

      const result = await controller.findAll(page, limit);

      expect(mockUsersService.findAll).toHaveBeenCalledWith({ page, limit });
      expect(result).toEqual(paginatedResult);
    });

    it('should handle errors during findAll', async () => {
      mockUsersService.findAll.mockRejectedValue(
        new InternalServerErrorException(),
      );
      await expect(controller.findAll(1, 10)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // --- Test Cases for findOneById() ---
  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = 'uuid-1';
      const expectedUser: PlainUser = {
        id: userId,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        is_active: true,
        roles: [],
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockUsersService.findOneById.mockResolvedValue(expectedUser);

      const result = await controller.findOne(userId);
      expect(result).toEqual(expectedUser);
      expect(mockUsersService.findOneById).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'uuid-nonexistent';
      mockUsersService.findOneById.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // --- Test Cases for updateUser() ---
  describe('update', () => {
    it('should update a user successfully', async () => {
      const userId = 'uuid-1';
      const updateDto: UpdateUserDto = { first_name: 'UpdatedName' };
      const expectedUser: PlainUser = {
        id: userId,
        email: 'test@example.com',
        first_name: 'UpdatedName',
        last_name: 'User',
        is_active: true,
        roles: [],
        created_at: new Date(),
        updated_at: new Date(),
      };
      mockUsersService.updateUser.mockResolvedValue(expectedUser);

      const result = await controller.update(userId, updateDto);
      expect(result).toEqual(expectedUser);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith(userId, updateDto);
    });

    it('should throw NotFoundException if user to update not found', async () => {
      const userId = 'uuid-nonexistent';
      const updateDto: UpdateUserDto = { first_name: 'UpdatedName' };
      mockUsersService.updateUser.mockRejectedValue(new NotFoundException());
      await expect(controller.update(userId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // --- Test Cases for removeUser() ---
  describe('remove', () => {
    it('should remove a user successfully', async () => {
      const userId = 'uuid-1';
      mockUsersService.removeUser.mockResolvedValue(undefined);

      await controller.remove(userId);
      expect(mockUsersService.removeUser).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user to remove not found', async () => {
      const userId = 'uuid-nonexistent';
      mockUsersService.removeUser.mockRejectedValue(new NotFoundException());
      await expect(controller.remove(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

});
