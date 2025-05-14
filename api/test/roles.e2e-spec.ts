import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../src/modules/users/entities/user.entity';
import { Role } from '../src/modules/roles/entities/role.entity';
import { RoleName } from '../src/modules/roles/entities/role-name.enum';
import { Permission } from '../src/modules/permissions/entities/permission.entity';

describe('Roles and Permissions (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let adminUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            entities: [User, Role, Permission],
            synchronize: true,
          }),
          inject: [ConfigService],
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create admin user and get token
    await setupAdminUser();
  });

  afterAll(async () => {
    await app.close();
  });

  async function setupAdminUser() {
    // Create admin user
    const adminResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'Admin123!',
        first_name: 'Admin',
        last_name: 'User',
      });

    adminUser = adminResponse.body;

    // Login and get token
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Admin123!',
      });

    adminToken = adminLoginResponse.body.access_token;
  }

  describe('Role Management', () => {
    it('should create a new role', () => {
      return request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'TestRole',
          description: 'A test role',
          is_system_role: false,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('TestRole');
          expect(res.body.is_system_role).toBe(false);
        });
    });

    it('should get all roles', () => {
      return request(app.getHttpServer())
        .get('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('permissions');
        });
    });

    it('should get role by name', () => {
      return request(app.getHttpServer())
        .get('/roles/TestRole')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('TestRole');
          expect(res.body).toHaveProperty('permissions');
        });
    });

    it('should update role', () => {
      return request(app.getHttpServer())
        .patch('/roles/TestRole')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Updated test role description',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.description).toBe('Updated test role description');
        });
    });

    it('should delete role', () => {
      return request(app.getHttpServer())
        .delete('/roles/TestRole')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Permission Management', () => {
    let testRole: Role;

    beforeEach(async () => {
      // Create a test role for permission tests
      const roleResponse = await request(app.getHttpServer())
        .post('/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'PermissionTestRole',
          description: 'Role for permission testing',
          is_system_role: false,
        });

      testRole = roleResponse.body;
    });

    it('should assign permission to role', () => {
      return request(app.getHttpServer())
        .post(`/roles/${testRole.name}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          action: 'read',
          subject: 'User',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.permissions).toContainEqual(
            expect.objectContaining({
              action: 'read',
              subject: 'User',
            }),
          );
        });
    });

    it('should get role permissions', () => {
      return request(app.getHttpServer())
        .get(`/roles/${testRole.name}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should remove permission from role', () => {
      return request(app.getHttpServer())
        .delete(`/roles/${testRole.name}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          action: 'read',
          subject: 'User',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.permissions).not.toContainEqual(
            expect.objectContaining({
              action: 'read',
              subject: 'User',
            }),
          );
        });
    });

    afterEach(async () => {
      // Clean up test role
      await request(app.getHttpServer())
        .delete(`/roles/${testRole.name}`)
        .set('Authorization', `Bearer ${adminToken}`);
    });
  });

  describe('System Role Protection', () => {
    it('should not allow deletion of system roles', () => {
      return request(app.getHttpServer())
        .delete(`/roles/${RoleName.ADMIN}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Cannot delete system role');
        });
    });

    it('should not allow modification of system role properties', () => {
      return request(app.getHttpServer())
        .patch(`/roles/${RoleName.ADMIN}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          is_system_role: false,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Cannot modify system role properties');
        });
    });
  });
}); 