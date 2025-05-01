import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from './modules/users/users.service';
import { User } from './modules/users/entities/user.entity';
import { CreateUserDto } from './modules/users/dto/create-user.dto';

// Mock bcrypt functions
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Mock User entity structure for testing
const mockUser: any = {
  id: 'mock-uuid',
  email: 'test@example.com',
  password_hash: 'hashed_password',
  first_name: 'Test',
  last_name: 'User',
  phone_number: undefined,
  avatar_url: undefined,
  is_active: true,
  created_at: new Date(),
  updated_at: new Date(),
  last_login_at: undefined,
  // Add relations if needed for other tests, keep simple for auth
  roles: [],
  assignedShows: [],
  assignedEquipment: [],
  recordedPayments: [],
  recordedExpenses: [],
  revenueAllocations: [],
  evaluationsGiven: [],
  evaluationsReceived: [],
  auditLogs: [],
  externalIncomesRecorded: [],
  assignedByShows: [],
  assignedByEquipment: [],
  userRoles: [],
};

const mockUserWithoutPassword: any = {
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
  roles: [],
  assignedShows: [],
  assignedEquipment: [],
  recordedPayments: [],
  recordedExpenses: [],
  revenueAllocations: [],
  evaluationsGiven: [],
  evaluationsReceived: [],
  auditLogs: [],
  externalIncomesRecorded: [],
  assignedByShows: [],
  assignedByEquipment: [],
  userRoles: [],
};

const mockAccessToken = 'mock-access-token';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  // Mock UsersService methods
  const mockUsersService = {
    findOneByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  // Mock JwtService methods
  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Tests for validateUser ---
  describe('validateUser', () => {
    it('should return user data (without password) if credentials are valid', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual(mockUserWithoutPassword);
      expect(usersService.findOneByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed_password');
    });

    it('should return null if user is not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toBeNull();
      expect(usersService.findOneByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null if password does not match', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Simulate wrong password

      const result = await service.validateUser('test@example.com', 'wrong_password');
      expect(result).toBeNull();
      expect(usersService.findOneByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong_password', 'hashed_password');
    });
  });

  // --- Tests for login ---
  describe('login', () => {
    it('should return an access token', async () => {
      mockJwtService.sign.mockReturnValue(mockAccessToken);
      const expectedPayload = { sub: mockUserWithoutPassword.id, email: mockUserWithoutPassword.email };

      const result = await service.login(mockUserWithoutPassword);

      expect(result).toEqual({ access_token: mockAccessToken });
      expect(jwtService.sign).toHaveBeenCalledWith(expectedPayload);
    });
  });

  // --- Tests for signup ---
  describe('signup', () => {
    const createUserDto: CreateUserDto = {
      email: 'new@example.com',
      password: 'new_password',
      first_name: 'New',
      last_name: 'User',
    };
    const createdUser = { ...mockUserWithoutPassword, id: 'new-uuid', email: 'new@example.com' };

    it('should call usersService.createUser and return the new user (without password)', async () => {
      const createdUserMock: any = { 
        ...mockUserWithoutPassword, 
        id: 'new-uuid', 
        email: 'new@example.com' 
      };
      mockUsersService.createUser.mockResolvedValue(createdUserMock);

      const result = await service.signup(createUserDto);

      expect(result).toEqual(createdUserMock);
      expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
    });

    it('should propagate ConflictException from usersService', async () => {
       mockUsersService.createUser.mockRejectedValue(new ConflictException('Email already registered'));

       await expect(service.signup(createUserDto)).rejects.toThrow(ConflictException);
       expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
     });

     it('should propagate other errors from usersService', async () => {
       mockUsersService.createUser.mockRejectedValue(new Error('Some other error'));

       await expect(service.signup(createUserDto)).rejects.toThrow(Error);
       expect(usersService.createUser).toHaveBeenCalledWith(createUserDto);
     });
  });
});
