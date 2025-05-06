import { Test, TestingModule } from '@nestjs/testing';
import { ShowRolesController } from './show-roles.controller';
import { ShowRolesService } from './show-roles.service';
import { CreateShowRoleDto } from './dto/create-show-role.dto';
import { UpdateShowRoleDto } from './dto/update-show-role.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard'; // Use alias
import { RolesGuard } from '@/core/guards/roles.guard'; // Use alias
import { RoleName } from '@/modules/roles/entities/role.entity'; // Use alias
import { ShowRole } from './entities/show-role.entity';
import { Pagination } from 'nestjs-typeorm-paginate';

// Mock Service Type Helper (Explicit definition)
type MockShowRolesService = {
  create: jest.Mock;
  findAll: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
};

// Function to create the mock service instance
const createMockShowRolesService = (): MockShowRolesService => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('ShowRolesController', () => {
  let controller: ShowRolesController;
  let service: MockShowRolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShowRolesController],
      providers: [
        { provide: ShowRolesService, useFactory: createMockShowRolesService },
      ],
    })
    // Mock guards
    .overrideGuard(JwtAuthGuard).useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard).useValue({ canActivate: jest.fn(() => true) })
    .compile();

    controller = module.get<ShowRolesController>(ShowRolesController);
    service = module.get(ShowRolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Test Cases for create() ---
  describe('create', () => {
    const createDto: CreateShowRoleDto = { name: 'Key Photographer', description: 'Main photographer' };
    const createdRole: Partial<ShowRole> = { id: 'sr1', name: 'Key Photographer' };

    it('should call service.create and return the result', async () => {
      service.create.mockResolvedValue(createdRole);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(createdRole);
    });

    it('should forward errors from the service', async () => {
      service.create.mockRejectedValue(new ForbiddenException('Create error'));

      await expect(controller.create(createDto)).rejects.toThrow(ForbiddenException);
    });
  });

  // --- Test Cases for findAll() ---
  describe('findAll', () => {
    const role1: Partial<ShowRole> = { id: 'sr1', name: 'Key Photographer' };
    const paginatedResult: Pagination<ShowRole> = {
      items: [role1 as ShowRole],
      meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
      links: { first: '', previous: '', next: '', last: '' }
    };

    it('should call service.findAll with pagination options and return the result', async () => {
      service.findAll.mockResolvedValue(paginatedResult);
      const options = { page: 1, limit: 10, route: '/show-roles' };

      const result = await controller.findAll(options.page, options.limit);

      expect(service.findAll).toHaveBeenCalledWith(options);
      expect(result).toEqual(paginatedResult);
    });

     it('should handle default pagination values', async () => {
      service.findAll.mockResolvedValue(paginatedResult); // Result doesn't matter
      const expectedOptions = { page: 1, limit: 10, route: '/show-roles' };

      await controller.findAll(); // Call without params

      expect(service.findAll).toHaveBeenCalledWith(expectedOptions);
    });

    it('should cap limit at 100', async () => {
        service.findAll.mockResolvedValue(paginatedResult);
        const expectedOptions = { page: 1, limit: 100, route: '/show-roles' };

        await controller.findAll(1, 200);

        expect(service.findAll).toHaveBeenCalledWith(expectedOptions);
    });
  });

  // --- Test Cases for findOne() ---
  describe('findOne', () => {
    const roleId = 'find-sr1';
    const foundRole: Partial<ShowRole> = { id: roleId, name: 'Key Photographer' };

    it('should call service.findOne and return the result', async () => {
      service.findOne.mockResolvedValue(foundRole);

      const result = await controller.findOne(roleId);

      expect(service.findOne).toHaveBeenCalledWith(roleId);
      expect(result).toEqual(foundRole);
    });

    it('should throw NotFoundException if service throws NotFoundException', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(roleId)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Test Cases for update() ---
  describe('update', () => {
    const roleId = 'update-sr1';
    const updateDto: UpdateShowRoleDto = { name: 'Lead Photographer' };
    const updatedRole: Partial<ShowRole> = { id: roleId, name: 'Lead Photographer' };

    it('should call service.update and return the result', async () => {
      service.update.mockResolvedValue(updatedRole);

      const result = await controller.update(roleId, updateDto);

      expect(service.update).toHaveBeenCalledWith(roleId, updateDto);
      expect(result).toEqual(updatedRole);
    });

    it('should forward NotFoundException from the service', async () => {
      service.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update(roleId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Test Cases for remove() ---
  describe('remove', () => {
    const roleId = 'delete-sr1';

    it('should call service.remove successfully', async () => {
      service.remove.mockResolvedValue(undefined); // remove returns void

      await controller.remove(roleId);

      expect(service.remove).toHaveBeenCalledWith(roleId);
    });

    it('should forward NotFoundException from the service', async () => {
      service.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(roleId)).rejects.toThrow(NotFoundException);
    });
  });

}); 