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

describe('Users (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let adminUser: User;
  let regularUser: User;

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

    // Create test users and get tokens
    await setupTestUsers();
  });

  afterAll(async () => {
    await app.close();
  });

  async function setupTestUsers() {
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

    // Create regular user
    const userResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@test.com',
        password: 'User123!',
        first_name: 'Regular',
        last_name: 'User',
      });

    regularUser = userResponse.body;

    // Login and get tokens
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Admin123!',
      });

    const userLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@test.com',
        password: 'User123!',
      });

    adminToken = adminLoginResponse.body.access_token;
    userToken = userLoginResponse.body.access_token;
  }

  describe('Authentication', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'newuser@test.com',
          password: 'NewUser123!',
          first_name: 'New',
          last_name: 'User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('newuser@test.com');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user@test.com',
          password: 'User123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
        });
    });

    it('should fail login with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user@test.com',
          password: 'WrongPassword123!',
        })
        .expect(401);
    });
  });

  describe('User Management', () => {
    it('should get all users (admin only)', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.items)).toBe(true);
          expect(res.body.items.length).toBeGreaterThan(0);
        });
    });

    it('should fail to get all users without admin role', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should get user profile', () => {
      return request(app.getHttpServer())
        .get(`/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(regularUser.id);
          expect(res.body.email).toBe(regularUser.email);
        });
    });

    it('should update user profile', () => {
      return request(app.getHttpServer())
        .patch(`/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          first_name: 'Updated',
          last_name: 'Name',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.first_name).toBe('Updated');
          expect(res.body.last_name).toBe('Name');
        });
    });

    it('should fail to update another user\'s profile', () => {
      return request(app.getHttpServer())
        .patch(`/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          first_name: 'Hacked',
          last_name: 'User',
        })
        .expect(403);
    });

    it('should delete user (admin only)', () => {
      return request(app.getHttpServer())
        .delete(`/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('Role Management', () => {
    it('should assign role to user (admin only)', () => {
      return request(app.getHttpServer())
        .post(`/users/${regularUser.id}/roles`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          roleName: RoleName.USER,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.roles).toContainEqual(
            expect.objectContaining({
              name: RoleName.USER,
            }),
          );
        });
    });

    it('should fail to assign role without admin permissions', () => {
      return request(app.getHttpServer())
        .post(`/users/${regularUser.id}/roles`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          roleName: RoleName.ADMIN,
        })
        .expect(403);
    });

    it('should remove role from user (admin only)', () => {
      return request(app.getHttpServer())
        .delete(`/users/${regularUser.id}/roles/${RoleName.USER}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.roles).not.toContainEqual(
            expect.objectContaining({
              name: RoleName.USER,
            }),
          );
        });
    });
  });
}); 