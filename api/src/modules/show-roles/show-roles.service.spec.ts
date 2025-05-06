import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShowRolesService } from './show-roles.service';
import { ShowRole } from './entities/show-role.entity';
import { CreateShowRoleDto } from './dto/create-show-role.dto';
import { UpdateShowRoleDto } from './dto/update-show-role.dto';
import { NotFoundException } from '@nestjs/common';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

// Mock the entire module - simplified
jest.mock('nestjs-typeorm-paginate', () => ({
    paginate: jest.fn(), // Return a simple mock function initially
}));

// Get the mocked function instance
const { paginate: mockPaginate } = require('nestjs-typeorm-paginate');

// --- Mock Repository Type ---
// Copied from roles.service.spec.ts
type MockRepository<T = any> = {
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock; // Added find for potential future use
  preload: jest.Mock;
  delete: jest.Mock;
  findBy: jest.Mock; // Added findBy for potential future use
  createQueryBuilder: jest.Mock;
};

// Mock Repository (instance, keep simple)
const mockShowRoleRepository = { // Renamed variable for clarity
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    preload: jest.fn(),
    delete: jest.fn(),
    findBy: jest.fn(), // Added findBy
    find: jest.fn(), // Added find
    createQueryBuilder: jest.fn().mockReturnValue({
        orderBy: jest.fn().mockReturnThis(),
    }),
};

const mockQueryBuilder = mockShowRoleRepository.createQueryBuilder();

describe('ShowRolesService', () => {
  let service: ShowRolesService;
  let repository: MockRepository<ShowRole>; // Keep using the type

  beforeEach(async () => {
    // Reset mocks before each test
    Object.values(mockShowRoleRepository).forEach(mockFn => mockFn.mockClear());
    // Add type assertion for mockFn
    Object.values(mockQueryBuilder).forEach((mockFn: jest.Mock) => mockFn.mockClear()); 
    // No need to reset mockQueryBuilder return value if it's constant

    // Reset and setup default mock for paginate here
    mockPaginate.mockClear();
    mockPaginate.mockResolvedValue({
        items: [],
        meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
        links: { first: '', previous: '', next: '', last: '' },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowRolesService,
        {
          provide: getRepositoryToken(ShowRole),
          useValue: mockShowRoleRepository, // Use the renamed mock object
        },
      ],
    }).compile();

    service = module.get<ShowRolesService>(ShowRolesService);
    repository = module.get<MockRepository<ShowRole>>(getRepositoryToken(ShowRole)); // Keep using the type
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- CREATE Tests --- //
  describe('create', () => {
    it('should create and return a show role', async () => {
      const createDto: CreateShowRoleDto = { name: 'Key Photographer', default_allocation_percentage: 30 };
      const expectedRole: ShowRole = {
        id: 'uuid-1', name: 'Key Photographer', description: null, default_allocation_percentage: 30,
        is_active: true, created_at: new Date(), updated_at: new Date()
      };

      mockShowRoleRepository.create.mockReturnValue(expectedRole);
      mockShowRoleRepository.save.mockResolvedValue(expectedRole);

      const result = await service.create(createDto);
      expect(mockShowRoleRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockShowRoleRepository.save).toHaveBeenCalledWith(expectedRole);
      expect(result).toEqual(expectedRole);
    });

    it('should throw an error if name already exists', async () => {
        const createDto: CreateShowRoleDto = { name: 'Duplicate Role' };
        const error = { code: '23505' }; // Simulate unique constraint violation
        mockShowRoleRepository.create.mockReturnValue({ name: 'Duplicate Role' }); // Need name for error message
        mockShowRoleRepository.save.mockRejectedValue(error);

        await expect(service.create(createDto)).rejects.toThrow(
            'ShowRole with name "Duplicate Role" already exists.'
        );
    });

     it('should re-throw non-unique constraint errors', async () => {
        const createDto: CreateShowRoleDto = { name: 'Other Error Role' };
        const error = new Error('Some other DB error');
        mockShowRoleRepository.create.mockReturnValue({ name: 'Other Error Role' });
        mockShowRoleRepository.save.mockRejectedValue(error);

        await expect(service.create(createDto)).rejects.toThrow('Some other DB error');
    });
  });

  // --- FINDALL Tests --- //
  describe('findAll', () => {
    it('should return a paginated list of show roles', async () => {
      const options: IPaginationOptions = { page: 1, limit: 10, route: '/show-roles' };
      const role1: Partial<ShowRole> = { id: 'uuid-1', name: 'Role 1' };
      const paginatedResult = {
          items: [role1],
          meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
          links: { first: '/show-roles?limit=10', previous: '', next: '', last: '/show-roles?page=1&limit=10' }
      };

      mockPaginate.mockResolvedValue(paginatedResult as any);

      const result = await service.findAll(options);

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
      mockShowRoleRepository.findOne.mockResolvedValue(expectedRole as ShowRole);

      const result = await service.findOne(roleId);
      expect(mockShowRoleRepository.findOne).toHaveBeenCalledWith({ where: { id: roleId } });
      expect(result).toEqual(expectedRole);
    });

    it('should throw NotFoundException if show role not found', async () => {
      const roleId = 'not-found-role';
      mockShowRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(roleId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(roleId)).rejects.toThrow(`ShowRole with ID "${roleId}" not found`);
    });
  });

  // --- UPDATE Tests --- //
  describe('update', () => {
    it('should update and return the show role', async () => {
      const roleId = 'uuid-r-update';
      const updateDto: UpdateShowRoleDto = { description: 'Updated Description' };
      const existingRole: ShowRole = { id: roleId, name: 'Support', description: 'Original', default_allocation_percentage: 10, is_active: true, created_at: new Date(), updated_at: new Date() };
      const preloadedRole: ShowRole = { ...existingRole, ...updateDto, updated_at: new Date() };

      mockShowRoleRepository.preload.mockResolvedValue(preloadedRole);
      mockShowRoleRepository.save.mockResolvedValue(preloadedRole);

      const result = await service.update(roleId, updateDto);
      expect(mockShowRoleRepository.preload).toHaveBeenCalledWith({ id: roleId, ...updateDto });
      expect(mockShowRoleRepository.save).toHaveBeenCalledWith(preloadedRole);
      expect(result).toEqual(preloadedRole);
    });

     it('should throw an error if updated name conflicts', async () => {
        const roleId = 'uuid-r-update-conflict';
        const updateDto: UpdateShowRoleDto = { name: 'Existing Name' };
        const preloadedRole = { id: roleId, name: 'Existing Name' }; // Simulate preload with conflicting name
        const error = { code: '23505' };

        mockShowRoleRepository.preload.mockResolvedValue(preloadedRole);
        mockShowRoleRepository.save.mockRejectedValue(error);

        await expect(service.update(roleId, updateDto)).rejects.toThrow(
            'ShowRole with name "Existing Name" already exists.'
        );
        expect(mockShowRoleRepository.preload).toHaveBeenCalledWith({ id: roleId, ...updateDto });
    });

    it('should throw NotFoundException if show role to update is not found', async () => {
      const roleId = 'non-existent-role-update';
      const updateDto: UpdateShowRoleDto = { is_active: false };
      mockShowRoleRepository.preload.mockResolvedValue(null);

      await expect(service.update(roleId, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(roleId, updateDto)).rejects.toThrow(`ShowRole with ID "${roleId}" not found`);
    });
  });

  // --- REMOVE Tests --- //
  describe('remove', () => {
    it('should remove the show role successfully', async () => {
      const roleId = 'uuid-r-remove';
      mockShowRoleRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await expect(service.remove(roleId)).resolves.toBeUndefined();
      expect(mockShowRoleRepository.delete).toHaveBeenCalledWith(roleId);
    });

    it('should throw NotFoundException if show role to remove is not found', async () => {
      const roleId = 'non-existent-role-remove';
      mockShowRoleRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.remove(roleId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(roleId)).rejects.toThrow(`ShowRole with ID "${roleId}" not found`);
      expect(mockShowRoleRepository.delete).toHaveBeenCalledWith(roleId);
    });
  });
}); 