import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './auth/dto/login.dto';
import { CreateUserDto } from './modules/users/dto/create-user.dto';
import { User, PlainUser } from './modules/users/entities/user.entity';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { UsersService } from './modules/users/users.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from './modules/roles/entities/role.entity';

// Mock User entity structure for testing
const mockUser: any = {
  id: 'mock-uuid',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  phone_number: undefined,
  avatar_url: undefined,
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
  last_login_at: undefined,
};

const mockAccessToken = { access_token: 'mock-jwt-token' };

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    signup: jest.fn(),
  };

  // Mock Guards - Allow requests to pass through for controller logic testing
  // More complex Guard testing might involve mocking the execution context
  const mockGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      // Override guards for unit testing controller logic
      .overrideGuard(LocalAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Test login endpoint ---
  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password',
    };
    // Mock request object populated by LocalAuthGuard
    const mockRequest = { user: mockUser };

    it('should call authService.login and return an access token', async () => {
      mockAuthService.login.mockResolvedValue(mockAccessToken);

      const result = await controller.login(mockRequest, loginDto);

      expect(result).toEqual(mockAccessToken);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });
  });

  // --- Test signup endpoint ---
  describe('signup', () => {
    const createUserDto: CreateUserDto = {
      email: 'new@example.com',
      password: 'password123',
      first_name: 'Test',
      last_name: 'User',
    };
    // This mock represents the plain user object returned by authService.signup
    const createdUserMock: PlainUser = {
      id: 'new-uuid',
      email: 'new@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_active: true,
      created_at: new Date(), // Consider consistent date mocking if needed
      updated_at: new Date(),
      roles: [],
    };
    const mockSignupLoginResult = { access_token: 'mock-jwt-token' }; // Token for signup flow

    it('should call authService.signup and authService.login, then return token and user', async () => {
      mockAuthService.signup.mockResolvedValue(createdUserMock);
      mockAuthService.login.mockResolvedValue(mockSignupLoginResult); // Mock login for the signup flow

      const result = await controller.signup(createUserDto);

      expect(authService.signup).toHaveBeenCalledWith(createUserDto);
      expect(authService.login).toHaveBeenCalledWith(createdUserMock);
      expect(result).toEqual({
        access_token: mockSignupLoginResult.access_token,
        user: createdUserMock,
      });
    });

    // Test for ConflictException from signup
    // ... existing code ...
  });

  // --- Test getProfile endpoint ---
  describe('getProfile', () => {
    // Mock request object populated by JwtAuthGuard (contains JWT payload)
    const mockJwtPayload = { sub: 'mock-uuid', email: 'test@example.com' };
    const mockRequest = { user: mockJwtPayload };

    it('should return the user payload from the request', () => {
      const result = controller.getProfile(mockRequest);
      expect(result).toEqual(mockJwtPayload);
    });
  });
});
