import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard, ROLES_KEY } from './roles.guard';
import { User } from '@/modules/users/entities/user.entity';
import { Role } from '@/modules/roles/entities/role.entity';

// Helper to create mock ExecutionContext
const createMockExecutionContext = (requiredRoles: string[] | undefined, user?: User): ExecutionContext => {
  const mockGetHandler = jest.fn();
  const mockGetClass = jest.fn();
  const mockReflector = {
    getAllAndOverride: jest.fn().mockImplementation((key, targets) => {
      if (key === ROLES_KEY) {
        // Simulate Reflector logic: check handler first, then class
        const handlerRoles = targets[0] === mockGetHandler ? requiredRoles : undefined;
        const classRoles = targets[1] === mockGetClass ? requiredRoles : undefined; // Simplified: Assume roles are set on both or neither for test
        return handlerRoles ?? classRoles; 
      }
      return undefined;
    }),
  };

  const mockContext = {
    getHandler: mockGetHandler,
    getClass: mockGetClass,
    switchToHttp: () => ({
      getRequest: () => ({ user }), // Return request with or without user
    }),
  } as unknown as ExecutionContext;

  // Attach the reflector instance needed by the guard constructor
  Reflect.defineMetadata('reflector', mockReflector, mockContext); 

  return mockContext;
};

// Helper to create mock User object with roles
const createMockUserWithRoles = (roleNames: string[]): User => ({
    id: 'user-1',
    email: 'test@test.com',
    roles: roleNames.map(name => ({ id: `role-${name}`, name } as Role)),
    // Add other necessary User fields if needed by the guard/context
} as User);


describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        // Provide a mock Reflector. In a real app, this is provided by NestJS
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if no roles are required', () => {
    // Mock reflector to return undefined or empty array for ROLES_KEY
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const mockContext = createMockExecutionContext(undefined, createMockUserWithRoles(['User'])); 
    expect(guard.canActivate(mockContext)).toBe(true);

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    const mockContextEmpty = createMockExecutionContext([], createMockUserWithRoles(['User'])); 
    expect(guard.canActivate(mockContextEmpty)).toBe(true);
  });

  it('should allow access if user has one of the required roles', () => {
    const requiredRoles = ['Admin', 'Manager'];
    const userWithAdmin = createMockUserWithRoles(['Admin']);
    const userWithManager = createMockUserWithRoles(['Manager', 'User']);

    // Mock reflector for this specific test
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key, targets) => {
      if (key === ROLES_KEY) return requiredRoles;
      return undefined;
    });

    const contextAdmin = createMockExecutionContext(requiredRoles, userWithAdmin);
    expect(guard.canActivate(contextAdmin)).toBe(true);

    const contextManager = createMockExecutionContext(requiredRoles, userWithManager);
    expect(guard.canActivate(contextManager)).toBe(true);
  });

  it('should deny access if user does not have any required roles', () => {
    const requiredRoles = ['Admin'];
    const userWithoutAdmin = createMockUserWithRoles(['User', 'Viewer']);

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
    const mockContext = createMockExecutionContext(requiredRoles, userWithoutAdmin);

    try {
      guard.canActivate(mockContext);
      fail('ForbiddenException should have been thrown'); 
    } catch (e) {
      expect(e).toBeInstanceOf(ForbiddenException);
      expect(e.message).toContain('Access Denied: Requires one of roles [Admin]');
    }
    // Or using Jest's built-in exception testing:
    // expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    // expect(() => guard.canActivate(mockContext)).toThrow('Access Denied: Requires one of roles [Admin]');
  });

  it('should deny access if user object is missing', () => {
    const requiredRoles = ['Admin'];
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
    // Pass undefined for user in mock context
    const mockContext = createMockExecutionContext(requiredRoles, undefined);

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(mockContext)).toThrow('Access Denied: User information missing.');
  });

  it('should deny access if user.roles array is missing or empty', () => {
    const requiredRoles = ['Admin'];
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

    // Test with user missing roles property
    const userWithoutRolesProp = { id: 'user-2' } as User; 
    const contextNoRolesProp = createMockExecutionContext(requiredRoles, userWithoutRolesProp);
    expect(() => guard.canActivate(contextNoRolesProp)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(contextNoRolesProp)).toThrow('Access Denied: User information missing.');

    // Test with user having empty roles array
    const userWithEmptyRoles = createMockUserWithRoles([]);
    const contextEmptyRoles = createMockExecutionContext(requiredRoles, userWithEmptyRoles);
    expect(() => guard.canActivate(contextEmptyRoles)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(contextEmptyRoles)).toThrow('Access Denied: Requires one of roles [Admin]'); 
  });
}); 