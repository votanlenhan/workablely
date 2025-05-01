import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

// Define JwtPayload interface locally for testing if not exported
interface JwtPayload {
  sub: string;
  email: string;
}

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') {
        return 'test-secret'; // Provide a mock secret for testing
      }
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const mockPayload: JwtPayload = { sub: 'user-id', email: 'test@example.com' };

    it('should return the payload if it is valid', async () => {
      const result = await strategy.validate(mockPayload);
      expect(result).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException if payload is null', async () => {
      await expect(strategy.validate(null as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if payload is missing sub', async () => {
      const invalidPayload = { email: 'test@example.com' } as JwtPayload;
      await expect(strategy.validate(invalidPayload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if payload is missing email', async () => {
      const invalidPayload = { sub: 'user-id' } as JwtPayload;
      await expect(strategy.validate(invalidPayload)).rejects.toThrow(UnauthorizedException);
    });

    // Note: Token signature and expiration validation are handled by Passport itself
    // before the validate method is called, so we don't test those here.
  });
}); 