import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In, SelectQueryBuilder } from 'typeorm';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';

import { UsersService } from './users.service';
import { User, PlainUser } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Mock the paginate function
jest.mock('nestjs-typeorm-paginate');
const mockPaginate = paginate as jest.Mock;

// Mock bcrypt functions
jest.mock('bcrypt');
const mockBcryptHash = bcrypt.hash as jest.Mock;
const mockBcryptCompare = bcrypt.compare as jest.Mock;

// --- Mock Repositories ---
const createMockRepository = <T = any>() => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
  findBy: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  }),
});

type MockRepository<T = any> = ReturnType<typeof createMockRepository>;
// --- End Mock Repositories ---

// Helper to create mock User object
const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'default-uuid',
  email: 'default@email.com',
  password_hash: 'default_hash',
  first_name: 'Default',
  last_name: 'User',
  phone_number: null,
  avatar_url: null,
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
  last_login_at: null,
  roles: [],
  ...overrides,
} as User);

// Helper to create mock Role objects
const createMockRole = (overrides: Partial<Role> = {}): Role => ({
    id: 'default-role-id',
    name: 'DefaultRoleName',
    description: null,
    is_system_role: false,
    created_at: new Date(),
    updated_at: new Date(),
    users: [],
    permissions: [],
    rolePermissions: [],
    ...overrides,
} as Role);

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository<User>;
  let roleRepository: MockRepository<Role>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: createMockRepository, // Use factory
        },
        {
          provide: getRepositoryToken(Role),
          useFactory: createMockRepository, // Use factory
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    roleRepository = module.get(getRepositoryToken(Role));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Test findOneByEmail ---
  describe('findOneByEmail', () => {
    const email = 'test@example.com';
    const mockUser = createMockUser({ id: 'u1', email: email });

    it('should call queryBuilder correctly and return user', async () => {
      const queryBuilder = userRepository.createQueryBuilder();
      (queryBuilder.getOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOneByEmail(email);

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('user.roles', 'role');
      expect(queryBuilder.addSelect).toHaveBeenCalledWith('user.password_hash');
      expect(queryBuilder.where).toHaveBeenCalledWith('user.email = :email', { email });
      expect(queryBuilder.getOne).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const queryBuilder = userRepository.createQueryBuilder();
      (queryBuilder.getOne as jest.Mock).mockResolvedValue(null);

      const result = await service.findOneByEmail(email);
      expect(result).toBeNull();
    });
  });

   // --- Test findOneById ---
   describe('findOneById', () => {
    const userId = 'user-id';
    const mockUser = createMockUser({ id: userId, email: 'find@by.id' });

    it('should find user by ID without password hash by default', async () => {
      const queryBuilder = userRepository.createQueryBuilder();
      (queryBuilder.getOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOneById(userId);

      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('user.roles', 'role');
      expect(queryBuilder.where).toHaveBeenCalledWith('user.id = :id', { id: userId });
      expect(queryBuilder.addSelect).not.toHaveBeenCalledWith('user.password_hash');
      expect(queryBuilder.getOne).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

     it('should find user by ID with password hash if requested', async () => {
        const queryBuilder = userRepository.createQueryBuilder();
        (queryBuilder.getOne as jest.Mock).mockResolvedValue(mockUser);

        await service.findOneById(userId, true); // includePasswordHash = true

        expect(queryBuilder.addSelect).toHaveBeenCalledWith('user.password_hash');
    });

    it('should throw NotFoundException if user not found', async () => {
      const queryBuilder = userRepository.createQueryBuilder();
      (queryBuilder.getOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOneById(userId)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Test findAll (Pagination) ---
  describe('findAll', () => {
    const paginationOptions = { page: 1, limit: 10 };
    const mockUsers = [
      createMockUser({ id: 'u1', email: 'a@b.c' }),
      createMockUser({ id: 'u2', email: 'd@e.f' }),
    ];
    const mockPlainUsers = mockUsers.map(({ password_hash, ...user }) => user as PlainUser);
    const mockPaginationResult = {
      items: mockUsers,
      meta: { totalItems: 2, itemCount: 2, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
      links: { first: '', previous: '', next: '', last: '' },
    };
    const expectedPaginatedPlainUsers = new Pagination<PlainUser>(
        mockPlainUsers, 
        mockPaginationResult.meta,
        mockPaginationResult.links
    );

    it('should return paginated plain users without password hash', async () => {
      mockPaginate.mockResolvedValue(mockPaginationResult);
      const queryBuilder = userRepository.createQueryBuilder();

      const result = await service.findAll(paginationOptions);

      expect(result).toEqual(expectedPaginatedPlainUsers);
      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('user.roles', 'role');
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('user.created_at', 'DESC');
      expect(mockPaginate).toHaveBeenCalledWith(queryBuilder, paginationOptions);
    });
  });

  // --- Test createUser ---
  describe('createUser', () => {
    const createUserDto: CreateUserDto = { email: 'new@user.com', password: 'pass', first_name: 'New', last_name: 'U', roleIds: ['r1'] };
    const hashedPassword = 'hashedPass';
    const mockRoles = [createMockRole({ id: 'r1' })];
    // Match the object structure created by TypeORM's `create` method (includes undefined optionals)
    const createdUserDataForMock = {
      email: createUserDto.email,
      first_name: createUserDto.first_name,
      last_name: createUserDto.last_name,
      password_hash: hashedPassword,
      roles: mockRoles,
      phone_number: undefined, 
      avatar_url: undefined, 
      is_active: true, // Default in entity
      // BaseEntity fields are not usually included here
    };
    const savedUser = createMockUser({ id: 'new-uuid', ...createdUserDataForMock, roles: mockRoles });
    const expectedPlainUser = (({ password_hash, ...rest }) => rest)(savedUser) as PlainUser;

    beforeEach(() => {
       mockBcryptHash.mockResolvedValue(hashedPassword);
       userRepository.findOne.mockResolvedValue(null); 
       roleRepository.findBy.mockResolvedValue(mockRoles);
       userRepository.create.mockReturnValue(createdUserDataForMock as any); // Use the adjusted mock data
       userRepository.save.mockResolvedValue(savedUser);
    });

    it('should create user with hashed password and roles if roleIds provided', async () => {
      const result = await service.createUser(createUserDto);
      
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
      expect(mockBcryptHash).toHaveBeenCalledWith(createUserDto.password, 10);
      // Check findBy is called only if roleIds exist
      expect(roleRepository.findBy).toHaveBeenCalledWith({ id: In(createUserDto.roleIds!) });
      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({ email: createUserDto.email }));
      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({ email: createUserDto.email }));
      expect(result.email).toEqual(createUserDto.email);
      expect(result.roles).toHaveLength(mockRoles.length);
    });

    it('should create user without roles if roleIds is not provided or empty', async () => {
      const dtoNoRoles: CreateUserDto = { ...createUserDto, roleIds: [] };
      const createdDataNoRoles = { ...createdUserDataForMock, roles: [] };
      const savedUserNoRoles = createMockUser({ ...savedUser, roles: []});
      const expectedPlainNoRoles = (({ password_hash, ...rest }) => rest)(savedUserNoRoles) as PlainUser;

      userRepository.create.mockReturnValue(createdDataNoRoles as any); 
      userRepository.save.mockResolvedValue(savedUserNoRoles);

      const result = await service.createUser(dtoNoRoles);

      expect(roleRepository.findBy).not.toHaveBeenCalled(); // Should not be called
      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({ email: dtoNoRoles.email, roles: [] }));
      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({ email: dtoNoRoles.email, roles: [] }));
      expect(result.roles).toEqual([]);
    });

    it('should throw ConflictException if email exists', async () => {
        userRepository.findOne.mockResolvedValue(createMockUser());
        await expect(service.createUser(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if roleIds are invalid', async () => {
        // Ensure roleIds exist before calling findBy
        const dtoWithRoles: CreateUserDto = { ...createUserDto, roleIds: ['invalid-id'] };
        roleRepository.findBy.mockResolvedValue([]); // Role not found
        await expect(service.createUser(dtoWithRoles)).rejects.toThrow(NotFoundException);
        expect(roleRepository.findBy).toHaveBeenCalledWith({ id: In(['invalid-id']) });
    });

    it('should throw InternalServerErrorException on save error', async () => {
        userRepository.save.mockRejectedValue(new Error('DB save failed'));
        await expect(service.createUser(createUserDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  // --- Test updateUser ---
   describe('updateUser', () => {
    const userId = 'user-to-update';
    // Use a more comprehensive DTO for the main success case
    const updateUserDto: UpdateUserDto = { 
        first_name: 'Updated', 
        last_name: 'Userovich',
        email: 'updated@test.com', // Include email change
        password: 'newPassword',
        roleIds: ['r2'] // Include role change
    }; 
    const existingUserInitial = createMockUser({ 
        id: userId, 
        email: 'original@test.com', 
        first_name: 'Original', 
        roles: [createMockRole({ id: 'r1' })] 
    });
    const mockRolesNew = [createMockRole({ id: 'r2' })];
    const hashedNewPassword = 'hashedNewPassword';

    // State after preload merges non-relational DTO fields
    const preloadedUser = createMockUser({ 
        ...existingUserInitial,
        first_name: updateUserDto.first_name, 
        last_name: updateUserDto.last_name, 
        // email, password, roles handled separately
    });

    // Final expected state of the user object passed to save
    const finalUserObjectForSave = createMockUser({ 
        ...preloadedUser, 
        email: updateUserDto.email, 
        password_hash: hashedNewPassword,
        roles: mockRolesNew, 
    });

    // Plain user expected as the return value
    const expectedPlainUserResult = (({ password_hash, ...rest }) => rest)(finalUserObjectForSave) as PlainUser;

    // Separate mock for the findOneById call *within* updateUser 
    // This should return the user state *before* the update starts for role logic
    const mockUserForInternalFindById = createMockUser({ 
        id: userId, 
        email: 'original@test.com', 
        first_name: 'Original', 
        roles: [createMockRole({ id: 'r1' })] // Return with original roles
    });

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks each time

        // Mock for the findOneById call used internally by updateUser when roleIds are present
        const mockFindByIdQueryBuilder = { // Renamed for clarity
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(mockUserForInternalFindById), // Returns user with initial roles
            addSelect: jest.fn().mockReturnThis(), // Ensure addSelect is mockable
        };
        // Point the main userRepository mock to return this specific QB mock
        userRepository.createQueryBuilder.mockReturnValue(mockFindByIdQueryBuilder as any);

        // Mock other repository methods used directly by updateUser
        userRepository.preload.mockResolvedValue(preloadedUser);
        userRepository.findOne.mockResolvedValue(null); // Mock for email conflict check (default: no conflict)
        roleRepository.findBy.mockResolvedValue(mockRolesNew); // Mock for role lookup
        mockBcryptHash.mockResolvedValue(hashedNewPassword); // Mock password hashing
        
        // Mock save to return the final state (as if DB saved and returned)
        userRepository.save.mockResolvedValue(finalUserObjectForSave); 
    });

    it('should update all fields (name, email, password, roles) successfully', async () => {
        // Arrange (mocks are set in beforeEach)
        
        // Act
        const result = await service.updateUser(userId, updateUserDto);

        // Assert
        expect(userRepository.preload).toHaveBeenCalledWith({ 
            id: userId, 
            // Pass only non-relational fields from DTO to preload
            first_name: updateUserDto.first_name, 
            last_name: updateUserDto.last_name,
            phone_number: undefined, // ensure optional fields are handled if needed
            avatar_url: undefined,
            is_active: undefined,
         });
        expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: updateUserDto.email } }); // Email conflict check
        expect(mockBcryptHash).toHaveBeenCalledWith(updateUserDto.password, 10); // Password hash
        // Internal findOneById called because roleIds are present
        expect(userRepository.createQueryBuilder).toHaveBeenCalledTimes(1); 
        const internalQueryBuilder = userRepository.createQueryBuilder.mock.results[0].value;
        expect(internalQueryBuilder.where).toHaveBeenCalledWith('user.id = :id', { id: userId });
        expect(internalQueryBuilder.getOne).toHaveBeenCalled();
        // Role lookup called
        expect(roleRepository.findBy).toHaveBeenCalledWith({ id: In(updateUserDto.roleIds!) });
        // Save called with the final merged object
        expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({ 
            id: userId, 
            first_name: 'Updated', 
            last_name: 'Userovich',
            email: 'updated@test.com',
            password_hash: hashedNewPassword,
            roles: mockRolesNew 
        }));
        // Check the returned plain user
        expect(result).toEqual(expectedPlainUserResult);
        expect(result.roles).toEqual(mockRolesNew);
    });

    it('should remove all roles if roleIds is empty array', async () => {
        const dtoEmptyRoles: UpdateUserDto = { roleIds: [] };
        const finalUserEmptyRoles = createMockUser({...preloadedUser, roles: []}); // Expected final state for save
        const expectedPlainResultEmptyRoles = (({ password_hash, ...rest }) => rest)(finalUserEmptyRoles) as PlainUser;
        
        // Arrange
        userRepository.preload.mockResolvedValue(preloadedUser); // Preload only other fields
         // Mock internal findOneById needed when roleIds are present (even if empty)
        const mockFindByIdQB = userRepository.createQueryBuilder();
        (mockFindByIdQB.getOne as jest.Mock).mockResolvedValue(mockUserForInternalFindById);
        roleRepository.findBy.mockResolvedValue([]); // findBy won't be called, but mock for safety
        userRepository.save.mockResolvedValue(finalUserEmptyRoles); // Save returns user with empty roles

        // Act
        const result = await service.updateUser(userId, dtoEmptyRoles);

        // Assert
        expect(userRepository.preload).toHaveBeenCalledWith({ id: userId }); 
        expect(userRepository.createQueryBuilder).toHaveBeenCalledTimes(2); // Adjusted: Expect 2 calls (beforeEach + service call)
        expect(roleRepository.findBy).not.toHaveBeenCalled(); 
        expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: userId, roles: [] }));
        expect(result.roles).toEqual([]);
        expect(result).toEqual(expectedPlainResultEmptyRoles);
    });

    it('should not change roles if roleIds is undefined', async () => {
        const dtoNoRoles: UpdateUserDto = { first_name: 'OnlyName' };
        // Expected state: preload merges name, roles remain from original user
        const preloadedNameOnly = createMockUser({...existingUserInitial, first_name: 'OnlyName'});
        const finalUserNameOnly = preloadedNameOnly; // Save object is same as preloaded + original roles
        const expectedPlainResultNoRoles = (({ password_hash, ...rest }) => rest)(finalUserNameOnly) as PlainUser;

        // Arrange
        userRepository.preload.mockResolvedValue(preloadedNameOnly);
        userRepository.save.mockResolvedValue(finalUserNameOnly); 
        // No internal findOneById call expected as roleIds is undefined

        // Act
        const result = await service.updateUser(userId, dtoNoRoles);

        // Assert
        expect(userRepository.preload).toHaveBeenCalledWith({ id: userId, first_name: 'OnlyName' });
        expect(userRepository.createQueryBuilder).not.toHaveBeenCalled(); // Internal findOneById NOT called
        expect(roleRepository.findBy).not.toHaveBeenCalled(); // Role lookup NOT called
        expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({ first_name: 'OnlyName' }));
        // Check roles remain unchanged from the *preloaded* user state (which should match initial)
        const savedArg = userRepository.save.mock.calls[0][0];
        expect(savedArg.roles).toEqual(existingUserInitial.roles); 
        expect(result.roles).toEqual(existingUserInitial.roles);
        expect(result).toEqual(expectedPlainResultNoRoles);
    });

    // ... other updateUser tests (password, email conflict, preload fail) seem okay, 
    //     but let's ensure the findOneById failure test is robust ...

    it('should throw NotFoundException if user not found by findOneById (when roleIds are provided)', async () => {
         // Arrange
         const dtoWithRoles: UpdateUserDto = { roleIds: ['r1'] };
         userRepository.preload.mockResolvedValue(preloadedUser); // Preload succeeds
         // Mock the internal findOneById call to fail
         const mockFindByIdQB = userRepository.createQueryBuilder();
         (mockFindByIdQB.getOne as jest.Mock).mockResolvedValue(null); 

         // Act & Assert
         await expect(service.updateUser(userId, dtoWithRoles)).rejects.toThrow(NotFoundException);
         expect(userRepository.createQueryBuilder).toHaveBeenCalledTimes(2); // Adjusted: Expect 2 calls (beforeEach + service call)
         expect(roleRepository.findBy).not.toHaveBeenCalled(); 
         expect(userRepository.save).not.toHaveBeenCalled(); 
    });

    // ... test for invalid roleIds seems okay ...
  });

  // --- Test assignRolesToUser ---
  describe('assignRolesToUser', () => {
    const userId = 'user-assign';
    const roleIdsToAssign = ['r2', 'r3'];
    const existingUserWithR1 = createMockUser({ id: userId, roles: [createMockRole({ id: 'r1' })] });
    const mockRolesR2R3 = [createMockRole({ id: 'r2' }), createMockRole({ id: 'r3' })];
    const finalRoles = [existingUserWithR1.roles[0], ...mockRolesR2R3]; // r1, r2, r3
    const userAfterSave = createMockUser({ ...existingUserWithR1, roles: finalRoles }); 
    const expectedPlainUserResult = (({ password_hash, ...rest }) => rest)(userAfterSave) as PlainUser;

    // Hold the mock QB instance to reset its methods
    let mockFindByIdQueryBuilder: any;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Explicitly redefine the QB mock and its methods for findOneById here
        // This ensures isolation between tests within this describe block
        mockFindByIdQueryBuilder = { 
             leftJoinAndSelect: jest.fn().mockReturnThis(),
             where: jest.fn().mockReturnThis(),
             getOne: jest.fn().mockResolvedValue(existingUserWithR1), // Default mock
             addSelect: jest.fn().mockReturnThis(), 
         };
         userRepository.createQueryBuilder.mockReturnValue(mockFindByIdQueryBuilder as any);

        // Reset mocks for other repository calls used in this block
        roleRepository.findBy.mockResolvedValue(mockRolesR2R3); // Default mock
        userRepository.save.mockResolvedValue(userAfterSave); // Default mock
    });

    it('should assign new roles to user successfully', async () => {
      // Arrange (uses default mocks from beforeEach)

      // Act
      const result = await service.assignRolesToUser(userId, roleIdsToAssign);
      
      // Assert
      expect(userRepository.createQueryBuilder).toHaveBeenCalledTimes(1); 
      expect(mockFindByIdQueryBuilder.getOne).toHaveBeenCalledTimes(1); // Verify QB method call
      expect(roleRepository.findBy).toHaveBeenCalledWith({ id: In(roleIdsToAssign) });
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      
      // Check the argument passed to save has the correct roles
      const savedArg = userRepository.save.mock.calls[0][0];
      expect(savedArg.roles).toBeInstanceOf(Array);
      const savedRoleIds = savedArg.roles.map((r: Role) => r.id);
      expect(savedRoleIds).toHaveLength(finalRoles.length);
      expect(savedRoleIds).toEqual(expect.arrayContaining(['r1', 'r2', 'r3'])); // Check IDs
      
      // Check the returned plain user object
      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(result.roles).toBeInstanceOf(Array);
      const resultRoleIds = result.roles.map((r: Role) => r.id);
      expect(resultRoleIds).toHaveLength(finalRoles.length);
      expect(resultRoleIds).toEqual(expect.arrayContaining(['r1', 'r2', 'r3']));
    });

    it('should not add duplicate roles', async () => {
        // Arrange
        const rolesWithDup = ['r1', 'r2']; // User already has r1
        const mockRolesFound = [createMockRole({ id: 'r1' }), createMockRole({ id: 'r2' })];
        const expectedFinalUniqueRoles = [existingUserWithR1.roles[0], mockRolesFound[1]]; // Should only contain r1, r2
        const userAfterSaveDups = createMockUser({ ...existingUserWithR1, roles: expectedFinalUniqueRoles });

        // Override default mocks for this specific test case
        roleRepository.findBy.mockResolvedValue(mockRolesFound); 
        userRepository.save.mockResolvedValue(userAfterSaveDups); 

        // Act
        const result = await service.assignRolesToUser(userId, rolesWithDup);
        
        // Assert
        expect(userRepository.createQueryBuilder).toHaveBeenCalledTimes(1); 
        expect(mockFindByIdQueryBuilder.getOne).toHaveBeenCalledTimes(1);
        expect(roleRepository.findBy).toHaveBeenCalledWith({ id: In(rolesWithDup) });
        expect(userRepository.save).toHaveBeenCalledTimes(1);

        // Assert ONLY the returned plain user object
        expect(result).toBeDefined();
        expect(result.id).toBe(userId);
        expect(result.roles).toBeInstanceOf(Array);
        const resultRoleIds = result.roles.map((r: Role) => r.id);
        expect(resultRoleIds).toHaveLength(2);
        expect(resultRoleIds).toEqual(expect.arrayContaining(['r1', 'r2']));
    });

    it('should throw BadRequestException if no role IDs provided', async () => {
        // Arrange (uses default mocks)
        // Act & Assert
        await expect(service.assignRolesToUser(userId, [])).rejects.toThrow(BadRequestException);
        expect(userRepository.createQueryBuilder).not.toHaveBeenCalled();
        expect(roleRepository.findBy).not.toHaveBeenCalled();
        expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
        // Arrange
        mockFindByIdQueryBuilder.getOne.mockResolvedValue(null); // Override QB mock for this test

        // Act & Assert
        await expect(service.assignRolesToUser(userId, roleIdsToAssign)).rejects.toThrow(NotFoundException);
        expect(userRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
        expect(mockFindByIdQueryBuilder.getOne).toHaveBeenCalledTimes(1);
        expect(roleRepository.findBy).not.toHaveBeenCalled();
        expect(userRepository.save).not.toHaveBeenCalled();
    });

     it('should throw NotFoundException if any role ID is invalid', async () => {
        // Arrange
        roleRepository.findBy.mockResolvedValue([createMockRole({ id: 'r2' })]); // Override role mock
        
        // Act & Assert
        await expect(service.assignRolesToUser(userId, roleIdsToAssign)).rejects.toThrow(NotFoundException);
        expect(userRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
        expect(mockFindByIdQueryBuilder.getOne).toHaveBeenCalledTimes(1);
        expect(roleRepository.findBy).toHaveBeenCalledWith({ id: In(roleIdsToAssign) });
        expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  // --- Test removeRolesFromUser ---
   describe('removeRolesFromUser', () => {
    const userId = 'user-remove-roles';
    const roleIdsToRemove = ['r1', 'r3']; // User has r1, r2. Try removing r1 and non-existent r3.
    const existingUserWithR1R2 = createMockUser({ 
        id: userId, 
        roles: [createMockRole({ id: 'r1' }), createMockRole({ id: 'r2' })] 
    });
    // Final roles should only be r2
    const finalRoles = [existingUserWithR1R2.roles[1]]; 
    const userAfterSave = createMockUser({ ...existingUserWithR1R2, roles: finalRoles });
    const expectedPlainUserResult = (({ password_hash, ...rest }) => rest)(userAfterSave) as PlainUser;

     beforeEach(() => {
        jest.clearAllMocks();
        // Mock the findOneById call used internally
         const mockFindByIdQueryBuilder = { // Fresh mock
             leftJoinAndSelect: jest.fn().mockReturnThis(),
             where: jest.fn().mockReturnThis(),
             getOne: jest.fn().mockResolvedValue(existingUserWithR1R2),
             addSelect: jest.fn().mockReturnThis(), // Include addSelect just in case
         };
         userRepository.createQueryBuilder.mockReturnValue(mockFindByIdQueryBuilder as any);
        // No role lookup needed for remove
        userRepository.save.mockResolvedValue(userAfterSave); // Mock save returning final state
    });

     it('should remove specified existing roles from user successfully', async () => {
        // Act
        const result = await service.removeRolesFromUser(userId, roleIdsToRemove);

        // Assert
        expect(userRepository.createQueryBuilder).toHaveBeenCalledTimes(1); // findOneById called
        // Check the object passed to save has roles filtered correctly
        expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({ 
            id: userId, 
            roles: expect.arrayContaining([expect.objectContaining({ id: 'r2' })]) // Check if r2 remains
        }));
        const savedArg = userRepository.save.mock.calls[0][0];
        expect(savedArg.roles).toHaveLength(1); // Only r2 should remain
        // Check returned plain user
        expect(result).toEqual(expectedPlainUserResult);
        expect(result.roles).toHaveLength(1);
        expect(result.roles[0].id).toBe('r2');
     });

    // ... other removeRolesFromUser tests (BadRequest, UserNotFound) seem okay ...
   });

  // --- Test removeUser ---
  describe('removeUser', () => {
    const userId = 'user-to-delete';

    it('should remove user successfully', async () => {
        userRepository.delete.mockResolvedValue({ affected: 1, raw: [] });
        await service.removeUser(userId);
        expect(userRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user not found', async () => {
        userRepository.delete.mockResolvedValue({ affected: 0, raw: [] });
        await expect(service.removeUser(userId)).rejects.toThrow(NotFoundException);
    });
  });

});
