import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './auth/dto/login.dto';
import { CreateUserDto } from './modules/users/dto/create-user.dto';
import { User } from './modules/users/entities/user.entity';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

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
      password: 'new_password',
      first_name: 'New',
      last_name: 'User',
    };
    const createdUserMock: any = {
      ...mockUser,
      id: 'new-uuid',
      email: 'new@example.com',
    } as Omit<User, 'password_hash'>;

    it('should call authService.signup and return the created user', async () => {
      mockAuthService.signup.mockResolvedValue(createdUserMock);

      const result = await controller.signup(createUserDto);

      expect(result).toEqual(createdUserMock);
      expect(authService.signup).toHaveBeenCalledWith(createUserDto);
    });
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
