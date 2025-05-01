import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from './local.strategy';
import { AuthService } from '../../auth.service';

// Mock user data (similar to auth.service.spec)
const mockUserWithoutPassword: any = {
  id: 'mock-uuid',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
};

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return the user if validation is successful', async () => {
      mockAuthService.validateUser.mockResolvedValue(mockUserWithoutPassword);

      const result = await strategy.validate('test@example.com', 'password');

      expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'password');
      expect(result).toEqual(mockUserWithoutPassword);
    });

    it('should throw UnauthorizedException if validation fails', async () => {
      mockAuthService.validateUser.mockResolvedValue(null); // Simulate validation failure

      await expect(strategy.validate('test@example.com', 'wrong_password')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.validateUser).toHaveBeenCalledWith('test@example.com', 'wrong_password');
    });
  });
}); 