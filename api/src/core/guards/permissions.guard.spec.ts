import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { Permission } from '../../modules/permissions/entities/permission.entity';
import { fail } from 'assert';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const createMockContext = (user: Partial<User>) => {
    return {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({
          user,
        }),
      }),
    } as ExecutionContext;
  };

  const mockUser: Partial<User> = {
    id: 'user-1',
    roles: [
      {
        id: 'role-1',
        name: 'Admin',
        is_system_role: true,
        users: [],
        created_at: new Date(),
        updated_at: new Date(),
        permissions: [
          {
            id: 'permission-1',
            action: 'create',
            subject: 'User',
            roles: [],
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: 'permission-2',
            action: 'read',
            subject: 'User',
            roles: [],
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true when no permissions are required', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(null);
      const result = await guard.canActivate(createMockContext(mockUser));
      expect(result).toBe(true);
    });

    it('should return true when user has required permission', async () => {
      mockReflector.getAllAndOverride.mockReturnValue({ action: 'create', subject: 'User' });
      const result = await guard.canActivate(createMockContext(mockUser));
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user lacks required permission', async () => {
      mockReflector.getAllAndOverride.mockReturnValue({ action: 'delete', subject: 'User' });
      try {
        await guard.canActivate(createMockContext(mockUser));
        // If it reaches here, the test should fail because an exception was expected
        fail('Expected canActivate to throw ForbiddenException, but it did not.');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('Access Denied: Requires permission "delete" on "User"');
      }
    });

    it('should handle user with multiple roles and permissions', async () => {
      const userWithMultipleRoles: Partial<User> = {
        ...mockUser,
        roles: [
          {
            id: 'role-1',
            name: 'Admin',
            is_system_role: true,
            users: [],
            created_at: new Date(),
            updated_at: new Date(),
            permissions: [
              {
                id: 'permission-1',
                action: 'create',
                subject: 'User',
                roles: [],
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          },
          {
            id: 'role-2',
            name: 'Manager',
            is_system_role: true,
            users: [],
            created_at: new Date(),
            updated_at: new Date(),
            permissions: [
              {
                id: 'permission-2',
                action: 'read',
                subject: 'User',
                roles: [],
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          },
        ],
      };

      mockReflector.getAllAndOverride.mockReturnValue({ action: 'read', subject: 'User' });
      const result = await guard.canActivate(createMockContext(userWithMultipleRoles));
      expect(result).toBe(true);
    });

    it('should handle user with no roles', async () => {
      const userWithNoRoles: Partial<User> = {
        ...mockUser,
        roles: [],
      };
      mockReflector.getAllAndOverride.mockReturnValue({ action: 'read', subject: 'User' });
      try {
        await guard.canActivate(createMockContext(userWithNoRoles));
        fail('Expected ForbiddenException');
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
        expect(err.message).toBe('Access Denied: Requires permission "read" on "User"');
      }
    });

    it('should handle user with roles but no permissions', async () => {
      const userWithRolesNoPermissions: Partial<User> = {
        ...mockUser,
        roles: [
          {
            id: 'role-1',
            name: 'Admin',
            is_system_role: true,
            users: [],
            created_at: new Date(),
            updated_at: new Date(),
            permissions: [],
          },
        ],
      };
      mockReflector.getAllAndOverride.mockReturnValue({ action: 'read', subject: 'User' });
      try {
        await guard.canActivate(createMockContext(userWithRolesNoPermissions));
        fail('Expected ForbiddenException');
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
        expect(err.message).toBe('Access Denied: Requires permission "read" on "User"');
      }
    });

    it('should handle user with wildcard permission', async () => {
      const userWithWildcardPermission: Partial<User> = {
        ...mockUser,
        roles: [
          {
            id: 'role-1',
            name: 'Admin',
            is_system_role: true,
            users: [],
            created_at: new Date(),
            updated_at: new Date(),
            permissions: [
              {
                id: 'permission-1',
                action: '*',
                subject: '*',
                roles: [],
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          },
        ],
      };

      mockReflector.getAllAndOverride.mockReturnValue({ action: 'any', subject: 'any' });
      const result = await guard.canActivate(createMockContext(userWithWildcardPermission));
      expect(result).toBe(true);
    });

    it('should handle user with subject wildcard permission', async () => {
      const userWithSubjectWildcard: Partial<User> = {
        ...mockUser,
        roles: [
          {
            id: 'role-1',
            name: 'Admin',
            is_system_role: true,
            users: [],
            created_at: new Date(),
            updated_at: new Date(),
            permissions: [
              {
                id: 'permission-1',
                action: 'read',
                subject: '*',
                roles: [],
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          },
        ],
      };

      mockReflector.getAllAndOverride.mockReturnValue({ action: 'read', subject: 'User' });
      const result = await guard.canActivate(createMockContext(userWithSubjectWildcard));
      expect(result).toBe(true);
    });

    it('should handle user with action wildcard permission', async () => {
      const userWithActionWildcard: Partial<User> = {
        ...mockUser,
        roles: [
          {
            id: 'role-1',
            name: 'Admin',
            is_system_role: true,
            users: [],
            created_at: new Date(),
            updated_at: new Date(),
            permissions: [
              {
                id: 'permission-1',
                action: '*',
                subject: 'User',
                roles: [],
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          },
        ],
      };

      mockReflector.getAllAndOverride.mockReturnValue({ action: 'delete', subject: 'User' });
      const result = await guard.canActivate(createMockContext(userWithActionWildcard));
      expect(result).toBe(true);
    });

    it('should handle case-insensitive permission matching', async () => {
      const userWithCaseInsensitivePermission: Partial<User> = {
        ...mockUser,
        roles: [
          {
            id: 'role-1',
            name: 'Admin',
            is_system_role: true,
            users: [],
            created_at: new Date(),
            updated_at: new Date(),
            permissions: [
              {
                id: 'permission-1',
                action: 'CREATE',
                subject: 'USER',
                roles: [],
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          },
        ],
      };

      mockReflector.getAllAndOverride.mockReturnValue({ action: 'create', subject: 'user' });
      const result = await guard.canActivate(createMockContext(userWithCaseInsensitivePermission));
      expect(result).toBe(true);
    });

    it('should handle request without user object', async () => {
      try {
        await guard.canActivate(createMockContext({}));
        fail('Expected ForbiddenException');
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
        expect(err.message).toBe('Access Denied: User information missing.');
      }
    });

    it('should handle request with malformed user object', async () => {
      const malformedUser = { id: 'user-1' }; // Missing roles array
      mockReflector.getAllAndOverride.mockReturnValue({ action: 'read', subject: 'User' });
      try {
        await guard.canActivate(createMockContext(malformedUser));
        fail('Expected ForbiddenException');
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
        expect(err.message).toBe('Access Denied: User information missing.');
      }
    });
  });
}); 