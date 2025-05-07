import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '@/modules/users/users.service';
import { User } from '@/modules/users/entities/user.entity';

// Define JwtPayload interface locally for testing if not exported
interface JwtPayload {
  sub: string;
  email: string;
}

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;
  let usersService: UsersService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') {
        return 'test-secret'; // Provide a mock secret for testing
      }
      return null;
    }),
  };

  // Mock UsersService
  const mockUsersService = {
    findOneById: jest.fn(),
  };

  beforeEach(async () => {
    // Clear mocks before each test
    mockUsersService.findOneById.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const mockUserEntity = {
      id: 'user-id',
      email: 'test@example.com',
      is_active: true,
      roles: [{ id: 'role-id', name: 'User' }],
    } as User;

    const mockPayload: JwtPayload = {
      sub: 'user-id',
      email: 'test@example.com',
    };

    it('should return the user if validation is successful', async () => {
      mockUsersService.findOneById.mockResolvedValue(mockUserEntity);
      const result = await strategy.validate(mockPayload);
      expect(usersService.findOneById).toHaveBeenCalledWith(mockPayload.sub);
      expect(result).toEqual(mockUserEntity);
    });

    it('should throw UnauthorizedException if payload is null', async () => {
      await expect(strategy.validate(null as any)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findOneById).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if payload is missing sub', async () => {
      const invalidPayload = { email: 'test@example.com' } as JwtPayload;
      await expect(strategy.validate(invalidPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findOneById).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user is not found by UsersService', async () => {
      mockUsersService.findOneById.mockResolvedValue(null);
      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findOneById).toHaveBeenCalledWith(mockPayload.sub);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUserEntity, is_active: false };
      mockUsersService.findOneById.mockResolvedValue(inactiveUser);
      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.findOneById).toHaveBeenCalledWith(mockPayload.sub);
    });

    // Note: Token signature and expiration validation are handled by Passport itself
    // before the validate method is called, so we don't test those here.
  });
});
