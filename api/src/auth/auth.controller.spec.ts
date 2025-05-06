import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { User, PlainUser } from '@/modules/users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { Request } from 'express';
import {
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

type MockAuthService = {
  login: jest.Mock;
  signup: jest.Mock;
};

const createMockAuthService = (): MockAuthService => ({
  login: jest.fn(),
  signup: jest.fn(),
});

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: MockAuthService;

  const mockUser: PlainUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    is_active: true,
    roles: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useFactory: createMockAuthService,
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    mockAuthService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    const createUserDto: CreateUserDto = {
      email: 'new@example.com',
      password: 'password123',
      first_name: 'New',
      last_name: 'User',
    };
    const signedUpUser: PlainUser = { ...mockUser, email: createUserDto.email, id: 'new-id' };

    it('should call authService.signup and return the created user', async () => {
      mockAuthService.signup.mockResolvedValue(signedUpUser);

      const result = await controller.signup(createUserDto);

      expect(mockAuthService.signup).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(signedUpUser);
    });

    it('should forward ConflictException from authService.signup', async () => {
      mockAuthService.signup.mockRejectedValue(new ConflictException());
      await expect(controller.signup(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should forward InternalServerErrorException from authService.signup', async () => {
      mockAuthService.signup.mockRejectedValue(new InternalServerErrorException());
      await expect(controller.signup(createUserDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };
    const mockReq = { user: mockUser } as unknown as Request;
    const loginResult = { access_token: 'mockAccessToken' };

    it('should call authService.login with the user from request and return token', async () => {
      mockAuthService.login.mockResolvedValue(loginResult);

      const result = await controller.login(mockReq, loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(loginResult);
    });
  });

  describe('getProfile', () => {
    const mockReq = { user: mockUser } as unknown as Request;

    it('should return the user object from the request (populated by guard)', () => {
      const result = controller.getProfile(mockReq);
      expect(result).toEqual(mockUser);
    });
  });
});
