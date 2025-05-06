import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShowRolesService } from './show-roles.service';
import { ShowRole } from './entities/show-role.entity';
import { CreateShowRoleDto } from './dto/create-show-role.dto';
import { UpdateShowRoleDto } from './dto/update-show-role.dto';
import { NotFoundException } from '@nestjs/common';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

// Mock the paginate function
jest.mock('nestjs-typeorm-paginate', () => ({
    paginate: jest.fn(),
}));
const { paginate: mockPaginate } = require('nestjs-typeorm-paginate');

// Mock Repository Type Helper (Explicit definition)
type MockRepository = {
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  preload: jest.Mock;
  delete: jest.Mock;
  createQueryBuilder: jest.Mock;
  // Add find, findBy if needed by tests
};

// Mock Query Builder
const mockQueryBuilder = {
    orderBy: jest.fn().mockReturnThis(),
    // Add other methods if needed
};

// Function to create the mock repository instance (now returns explicit type)
const createMockRepository = (): MockRepository => ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    preload: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
});

const mockShowRole: ShowRole = {
  id: 'test-uuid',
  name: 'Key Photographer',
  description: 'Primary shooter',
  default_allocation_percentage: 25.00,
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
  showAssignments: [],
};

describe('ShowRolesService', () => {
  let service: ShowRolesService;
  let repository: MockRepository; // Use the new explicit type

  beforeEach(async () => {
    // Reset mocks
    mockPaginate.mockClear();
    Object.values(mockQueryBuilder).forEach((mockFn: jest.Mock) => mockFn.mockClear());

    // Default mock for paginate
    mockPaginate.mockResolvedValue({
        items: [],
        meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
        links: { first: '', previous: '', next: '', last: '' },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowRolesService,
        { provide: getRepositoryToken(ShowRole), useFactory: createMockRepository },
      ],
    }).compile();

    service = module.get<ShowRolesService>(ShowRolesService);
    repository = module.get<MockRepository>(getRepositoryToken(ShowRole));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- CREATE Tests --- //
  describe('create', () => {
    const createDto: CreateShowRoleDto = { name: 'Key Photographer', description: 'Main photographer' };
    const expectedRole: ShowRole = {
      id: 'uuid-1',
      name: 'Key Photographer',
      description: 'Main photographer',
      default_allocation_percentage: 0,
      is_active: true,
      created_at: expect.any(Date),
      updated_at: expect.any(Date),
      showAssignments: [],
    };

    it('should create and return a show role', async () => {
      repository.create.mockReturnValue(expectedRole);
      repository.save.mockResolvedValue(expectedRole);

      const result = await service.create(createDto);
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(expectedRole);
      expect(result).toEqual(expectedRole);
    });

    it('should throw an error if name already exists', async () => {
        const error = { code: '23505' }; // Simulate unique constraint violation
        repository.create.mockReturnValue({ name: 'Duplicate Role' }); // Need name for error message
        repository.save.mockRejectedValue(error);

        await expect(service.create(createDto)).rejects.toThrow(
            'ShowRole with name "Duplicate Role" already exists.'
        );
    });

     it('should re-throw non-unique constraint errors', async () => {
        const error = new Error('Some other DB error');
        repository.create.mockReturnValue({ name: 'Other Error Role' });
        repository.save.mockRejectedValue(error);

        await expect(service.create(createDto)).rejects.toThrow('Some other DB error');
    });
  });

  // --- FINDALL Tests --- //
  describe('findAll', () => {
    it('should return a paginated list of show roles', async () => {
      const options: IPaginationOptions = { page: 1, limit: 10, route: '/show-roles' };
      const role1: Partial<ShowRole> = { id: 'uuid-r1', name: 'Role 1' }; // Corrected example ID
      const paginatedResult: Pagination<ShowRole> = {
          items: [role1 as ShowRole],
          meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
          links: { first: '/show-roles?limit=10', previous: '', next: '', last: '/show-roles?page=1&limit=10' }
      };

      // Setup mocks before calling the service method
      mockPaginate.mockResolvedValue(paginatedResult);
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any); // Return the mock builder

      const result = await service.findAll(options);

      // Verify calls
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('show_role');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('show_role.name', 'ASC');
      expect(mockPaginate).toHaveBeenCalledWith(mockQueryBuilder, options);
      expect(result).toEqual(paginatedResult);
    });
  });

  // --- FINDONE Tests --- //
  describe('findOne', () => {
    it('should return a show role if found', async () => {
      const roleId = 'uuid-r-find';
      const expectedRole: Partial<ShowRole> = { id: roleId, name: 'Retouch' };
      repository.findOne.mockResolvedValue(expectedRole as ShowRole);

      const result = await service.findOne(roleId);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: roleId } });
      expect(result).toEqual(expectedRole);
    });

    it('should throw NotFoundException if show role not found', async () => {
      const roleId = 'not-found-role';
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(roleId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(roleId)).rejects.toThrow(`ShowRole with ID "${roleId}" not found`);
    });
  });

  // --- UPDATE Tests --- //
  describe('update', () => {
    const roleId = 'role-uuid-update';
    const updateDto: UpdateShowRoleDto = { name: 'Lead Photographer', default_allocation_percentage: 60 };
    const existingRole: ShowRole = { id: roleId, name: 'Support', description: 'Original', default_allocation_percentage: 10, is_active: true, created_at: new Date(), updated_at: new Date(), showAssignments: [] };
    const preloadedData = { ...existingRole, ...updateDto };
    const updatedRole = { ...preloadedData, updated_at: new Date() };

    it('should update a show role successfully', async () => {
      repository.preload.mockResolvedValue(preloadedData);
      repository.save.mockResolvedValue(updatedRole);

      const result = await service.update(roleId, updateDto);
      expect(repository.preload).toHaveBeenCalledWith({ id: roleId, ...updateDto });
      expect(repository.save).toHaveBeenCalledWith(updatedRole);
      expect(result).toEqual(updatedRole);
    });

     it('should throw an error if updated name conflicts', async () => {
        const error = { code: '23505' };

        repository.preload.mockResolvedValue({ id: roleId, name: 'Existing Name' });
        repository.save.mockRejectedValue(error);

        await expect(service.update(roleId, updateDto)).rejects.toThrow(
            'ShowRole with name "Existing Name" already exists.'
        );
        expect(repository.preload).toHaveBeenCalledWith({ id: roleId, ...updateDto });
    });

    it('should throw NotFoundException if show role to update is not found', async () => {
      repository.preload.mockResolvedValue(null);

      await expect(service.update(roleId, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(roleId, updateDto)).rejects.toThrow(`ShowRole with ID "${roleId}" not found`);
    });
  });

  // --- REMOVE Tests --- //
  describe('remove', () => {
    it('should remove the show role successfully', async () => {
      const roleId = 'uuid-r-remove';
      repository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await expect(service.remove(roleId)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(roleId);
    });

    it('should throw NotFoundException if show role to remove is not found', async () => {
      const roleId = 'non-existent-role-remove';
      repository.delete.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.remove(roleId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(roleId)).rejects.toThrow(`ShowRole with ID "${roleId}" not found`);
      expect(repository.delete).toHaveBeenCalledWith(roleId);
    });
  });
}); 