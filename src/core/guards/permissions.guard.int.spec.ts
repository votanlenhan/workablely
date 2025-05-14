import { INestApplication, Controller, Get, UseGuards, Req, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { PermissionsGuard } from './permissions.guard';
import { RequiredPermissions } from '../decorators/required-permissions.decorator';
import { Reflector } from '@nestjs/core';

@Controller('test')
@UseGuards(PermissionsGuard)
export class TestPermissionsController {
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
      .get('/test/protected')
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
      .get('/test/protected')
      .expect(403);
  });

  it('should allow access for user with wildcard permission', async () => {
    app.use(setUser({
      roles: [
        { permissions: [{ action: '*', subject: '*' }] },
      ],
    }));
    await request(app.getHttpServer())
      .get('/test/protected')
      .expect(200)
      .expect(res => {
        expect(res.body.message).toBe('Access granted');
      });
  });

  it('should deny access for user with no roles', async () => {
    app.use(setUser({ roles: [] }));
    await request(app.getHttpServer())
      .get('/test/protected')
      .expect(403);
  });

  it('should deny access for user with roles but no permissions', async () => {
    app.use(setUser({ roles: [{ permissions: [] }] }));
    await request(app.getHttpServer())
      .get('/test/protected')
      .expect(403);
  });
}); 