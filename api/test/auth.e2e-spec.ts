import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../src/modules/users/entities/user.entity';
import { Role } from '../src/modules/roles/entities/role.entity';
import { Permission } from '../src/modules/permissions/entities/permission.entity';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let testUser: User;
  let userToken: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Registration', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test123!',
          first_name: 'Test',
          last_name: 'User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('test@example.com');
          expect(res.body).not.toHaveProperty('password');
          testUser = res.body;
        });
    });

    it('should not register user with existing email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test123!',
          first_name: 'Test',
          last_name: 'User',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Email already exists');
        });
    });

    it('should validate password strength', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'weak@example.com',
          password: 'weak',
          first_name: 'Weak',
          last_name: 'Password',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Password is too weak');
        });
    });

    it('should validate email format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Test123!',
          first_name: 'Invalid',
          last_name: 'Email',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid email format');
        });
    });
  });

  describe('Login', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          userToken = res.body.access_token;
        });
    });

    it('should not login with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should not login with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123!',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });
  });

  describe('Password Reset', () => {
    it('should request password reset', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'test@example.com',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('Password reset email sent');
        });
    });

    it('should not send reset email for non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('User not found');
        });
    });

    // Note: In a real test environment, you would need to:
    // 1. Mock the email service
    // 2. Extract the reset token from the email
    // 3. Test the reset password endpoint with the token
    it('should reset password with valid token', async () => {
      // This is a placeholder test. In a real implementation, you would:
      // 1. Get the reset token from the email service mock
      // 2. Use it to reset the password
      const resetToken = 'mock-reset-token';
      
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewTest123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('Password reset successful');
        });
    });
  });

  describe('Token Validation', () => {
    it('should validate valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/validate')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe('test@example.com');
        });
    });

    it('should reject invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/validate')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid token');
        });
    });

    it('should reject expired token', async () => {
      // Create an expired token (this would require mocking the JWT service)
      const expiredToken = 'mock-expired-token';
      
      return request(app.getHttpServer())
        .get('/auth/validate')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Token expired');
        });
    });
  });

  describe('Logout', () => {
    it('should logout successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('Logged out successfully');
        });
    });

    it('should handle logout without token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('No token provided');
        });
    });
  });
}); 