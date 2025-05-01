import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

// Define a simpler type for the mock repository methods we use
type MockUserRepository = Partial<Record<keyof Pick<Repository<User>, 'findOne' | 'create' | 'save'>, jest.Mock>>;

// Create a factory for the mock repository
const createMockRepository = (): MockUserRepository => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

// Mock bcrypt functions
jest.mock('bcrypt', () => ({  compare: jest.fn(),  hash: jest.fn(),}));

// Mock User data
const mockUser: any = {
  id: 'user-uuid-1',
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
};

const mockUserDto: CreateUserDto = {
  email: 'new@example.com',
  password: 'password123',
  first_name: 'New',
  last_name: 'User',
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: MockUserRepository; // Use the specific mock type

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User), 
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    // Get the mocked repository with the correct type
    repository = module.get<MockUserRepository>(getRepositoryToken(User)); 

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Test findOneByEmail ---
  describe('findOneByEmail', () => {
    it('should call repository.findOne with correct email and return the user', async () => {
      // repository.findOne should be defined because createMockRepository defines it
      repository.findOne!.mockResolvedValue(mockUser);
      const result = await service.findOneByEmail('test@example.com');
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toEqual(mockUser);
    });

    it('should return null if repository.findOne returns null', async () => {
      repository.findOne!.mockResolvedValue(null);
      const result = await service.findOneByEmail('notfound@example.com');
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'notfound@example.com' } });
      expect(result).toBeNull();
    });
  });

  // --- Test createUser ---
  describe('createUser', () => {
    const hashedPassword = 'hashed_new_password';
    const createInputData: any = {
        email: mockUserDto.email,
        first_name: mockUserDto.first_name,
        last_name: mockUserDto.last_name,
        phone_number: mockUserDto.phone_number,
        password_hash: hashedPassword,
    };
    const createdEntity: any = { ...createInputData };
    const savedUserEntity: any = { ...createdEntity, id: 'generated-uuid', created_at: new Date(), updated_at: new Date() }; 
    const expectedResult: any = { ...savedUserEntity }; 
    delete expectedResult.password_hash; 

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      repository.findOne!.mockResolvedValue(null); 
      repository.create!.mockReturnValue(createdEntity);
      repository.save!.mockResolvedValue(savedUserEntity); 
    });

    it('should hash password, create and save user, then return user without password', async () => {
      const result = await service.createUser(mockUserDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: mockUserDto.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserDto.password, 10); 
      expect(repository.create).toHaveBeenCalledWith(createInputData);
      expect(repository.save).toHaveBeenCalledWith(createdEntity);
      expect(result).toEqual(expect.objectContaining(expectedResult)); 
    });

    it('should throw ConflictException if user already exists', async () => {
      repository.findOne!.mockResolvedValue(mockUser); 
      await expect(service.createUser(mockUserDto)).rejects.toThrow(ConflictException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: mockUserDto.email } });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if repository.save fails', async () => {
      repository.save!.mockRejectedValue(new Error('DB error')); 
      await expect(service.createUser(mockUserDto)).rejects.toThrow(InternalServerErrorException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: mockUserDto.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserDto.password, 10);
      expect(repository.create).toHaveBeenCalledWith(createInputData);
      expect(repository.save).toHaveBeenCalledWith(createdEntity);
    });
  });
});
