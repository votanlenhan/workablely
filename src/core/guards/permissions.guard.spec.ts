import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { PERMISSIONS_KEY } from '../decorators/required-permissions.decorator';
import { mockDeep } from 'jest-mock-extended';
import { INestApplication, Controller, Get, UseGuards, Req, Module } from '@nestjs/common';
import * as request from 'supertest';
import { RequiredPermissions } from '../decorators/required-permissions.decorator';

function dummyHandler() {}
class DummyClass {}

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
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
    const createMockContext = (user: any = {
      roles: [
        {
          permissions: [
            { action: 'read', subject: 'User' },
            { action: 'create', subject: 'Role' },
          ],
        },
      ],
    }) => {
      const context = mockDeep<ExecutionContext>();
      context.switchToHttp.mockReturnValue({ getRequest: () => ({ user }) });
      context.getHandler.mockReturnValue(dummyHandler);
      context.getClass.mockReturnValue(DummyClass);
      return context;
    };

    it('should return true when no permissions are required', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
      const context = createMockContext();
      expect(await guard.canActivate(context)).toBe(true);
    });

    it('should return true when user has required permission', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        action: 'read',
        subject: 'User',
      });
      const context = createMockContext();
      expect(await guard.canActivate(context)).toBe(true);
    });

    it('should throw ForbiddenException when user lacks required permission', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        action: 'delete',
        subject: 'User',
      });
      const context = createMockContext();
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should handle user with multiple roles and permissions', async () => {
      const user = {
        roles: [
          { permissions: [{ action: 'read', subject: 'User' }] },
          { permissions: [{ action: 'create', subject: 'Role' }] },
        ],
      };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        action: 'create',
        subject: 'Role',
      });
      const context = createMockContext(user);
      expect(await guard.canActivate(context)).toBe(true);
    });

    it('should handle user with no roles', async () => {
      const user = { roles: [] };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        action: 'read',
        subject: 'User',
      });
      const context = createMockContext(user);
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should handle user with roles but no permissions', async () => {
      const user = { roles: [{ permissions: [] }] };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        action: 'read',
        subject: 'User',
      });
      const context = createMockContext(user);
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should handle user with wildcard permission', async () => {
      const user = {
        roles: [
          { permissions: [{ action: '*', subject: '*' }] },
        ],
      };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        action: 'any',
        subject: 'any',
      });
      const context = createMockContext(user);
      expect(await guard.canActivate(context)).toBe(true);
    });

    it('should handle user with subject wildcard permission', async () => {
      const user = {
        roles: [
          { permissions: [{ action: 'read', subject: '*' }] },
        ],
      };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        action: 'read',
        subject: 'any',
      });
      const context = createMockContext(user);
      expect(await guard.canActivate(context)).toBe(true);
    });

    it('should handle user with action wildcard permission', async () => {
      const user = {
        roles: [
          { permissions: [{ action: '*', subject: 'User' }] },
        ],
      };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        action: 'any',
        subject: 'User',
      });
      const context = createMockContext(user);
      expect(await guard.canActivate(context)).toBe(true);
    });

    it('should handle case-insensitive permission matching', async () => {
      const user = {
        roles: [
          { permissions: [{ action: 'READ', subject: 'USER' }] },
        ],
      };
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        action: 'read',
        subject: 'user',
      });
      const context = createMockContext(user);
      expect(await guard.canActivate(context)).toBe(true);
    });

    it('should handle request without user object', async () => {
      const context = createMockContext(undefined);
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        action: 'read',
        subject: 'User',
      });
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });

    it('should handle request with malformed user object', async () => {
      const context = createMockContext({ user: null });
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
        action: 'read',
        subject: 'User',
      });
      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    });
  });
});

@Controller('test-permissions')
@UseGuards(PermissionsGuard)
class TestPermissionsController {
  @Get('protected')
  @RequiredPermissions({ action: 'read', subject: 'Resource' })
  getProtected(@Req() req: any) {
    return { message: 'Access granted', user: req.user };
  }
}

@Module({
  controllers: [TestPermissionsController],
  providers: [PermissionsGuard, Reflector],
})
class TestPermissionsModule {}

describe('PermissionsGuard (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestPermissionsModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  function setUser(user: any) {
    return (req: any, res: any, next: any) => {
      req.user = user;
      next();
    };
  }

  it('should allow access for user with required permission', async () => {
    app.use(setUser({
      roles: [
        { permissions: [{ action: 'read', subject: 'Resource' }] },
      ],
    }));
    await request(app.getHttpServer())
      .get('/test-permissions/protected')
      .expect(200)
      .expect(res => {
        expect(res.body.message).toBe('Access granted');
      });
  });

  it('should deny access for user without required permission', async () => {
    app.use(setUser({
      roles: [
        { permissions: [{ action: 'update', subject: 'Resource' }] },
      ],
    }));
    await request(app.getHttpServer())
      .get('/test-permissions/protected')
      .expect(403);
  });

  it('should allow access for user with wildcard permission', async () => {
    app.use(setUser({
      roles: [
        { permissions: [{ action: '*', subject: '*' }] },
      ],
    }));
    await request(app.getHttpServer())
      .get('/test-permissions/protected')
      .expect(200)
      .expect(res => {
        expect(res.body.message).toBe('Access granted');
      });
  });

  it('should deny access for user with no roles', async () => {
    app.use(setUser({ roles: [] }));
    await request(app.getHttpServer())
      .get('/test-permissions/protected')
      .expect(403);
  });

  it('should deny access for user with roles but no permissions', async () => {
    app.use(setUser({ roles: [{ permissions: [] }] }));
    await request(app.getHttpServer())
      .get('/test-permissions/protected')
      .expect(403);
  });
}); 