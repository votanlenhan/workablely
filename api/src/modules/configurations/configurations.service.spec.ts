import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigurationsService } from './configurations.service';
import { Configuration } from './entities/configuration.entity';
import { ConfigurationValueType } from './entities/configuration-value-type.enum';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

// Mocking nestjs-typeorm-paginate
jest.mock('nestjs-typeorm-paginate', () => ({
  ...jest.requireActual('nestjs-typeorm-paginate'),
  paginate: jest.fn(),
}));

const mockConfigurationId = 'config-uuid-123';
const mockConfigurationKey = 'TEST_KEY';
const mockConfiguration: Configuration = {
  id: mockConfigurationId,
  key: mockConfigurationKey,
  value: 'Test Value',
  value_type: ConfigurationValueType.STRING,
  description: 'A test configuration',
  is_editable: true,
  created_at: new Date(),
  updated_at: new Date(),
};

// Mock Repository
const mockConfigurationRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(), // For paginate fallback or direct use if needed
  update: jest.fn(), // Though service uses save for update after fetch
  delete: jest.fn(),
  // queryBuilder and other specific methods used by paginate will be mocked via jest.mock('nestjs-typeorm-paginate')
};

describe('ConfigurationsService', () => {
  let service: ConfigurationsService;
  let repository: Repository<Configuration>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigurationsService,
        {
          provide: getRepositoryToken(Configuration),
          useValue: mockConfigurationRepository,
        },
      ],
    }).compile();

    service = module.get<ConfigurationsService>(ConfigurationsService);
    repository = module.get<Repository<Configuration>>(getRepositoryToken(Configuration));
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Test for create() ---
  describe('create', () => {
    const createDto: CreateConfigurationDto = {
      key: 'NEW_KEY',
      value: 'New Value',
      value_type: ConfigurationValueType.STRING,
      description: 'A new config',
      is_editable: true,
    };

    it('should create and return a configuration if key does not exist', async () => {
      mockConfigurationRepository.findOne.mockResolvedValue(null); // No existing config with this key
      mockConfigurationRepository.create.mockReturnValue(createDto as any); // TypeORM create might return partial
      mockConfigurationRepository.save.mockResolvedValue({ ...mockConfiguration, ...createDto } as Configuration);

      const result = await service.create(createDto);
      expect(result.key).toBe(createDto.key);
      expect(mockConfigurationRepository.findOne).toHaveBeenCalledWith({ where: { key: createDto.key } });
      expect(mockConfigurationRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockConfigurationRepository.save).toHaveBeenCalledWith(createDto);
    });

    it('should throw ConflictException if configuration with the same key already exists', async () => {
      mockConfigurationRepository.findOne.mockResolvedValue(mockConfiguration); // Existing config found
      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockConfigurationRepository.findOne).toHaveBeenCalledWith({ where: { key: createDto.key } });
    });

    it('should throw InternalServerErrorException on repository.save failure', async () => {
      mockConfigurationRepository.findOne.mockResolvedValue(null);
      mockConfigurationRepository.create.mockReturnValue(createDto as any);
      mockConfigurationRepository.save.mockRejectedValue(new Error('DB Save Error'));
      await expect(service.create(createDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  // --- Test for findAll() ---
  describe('findAll', () => {
    const paginationOptions: IPaginationOptions = { page: 1, limit: 10, route: 'configurations' };
    const mockPaginatedResult = new Pagination([mockConfiguration], { totalItems: 1, itemCount: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 }, {});

    it('should return paginated configurations', async () => {
      (require('nestjs-typeorm-paginate').paginate as jest.Mock).mockResolvedValue(mockPaginatedResult);
      const result = await service.findAll(paginationOptions);
      expect(result).toEqual(mockPaginatedResult);
      expect(require('nestjs-typeorm-paginate').paginate).toHaveBeenCalledWith(repository, paginationOptions);
    });

    it('should throw InternalServerErrorException on paginate failure', async () => {
      (require('nestjs-typeorm-paginate').paginate as jest.Mock).mockRejectedValue(new Error('Paginate Error'));
      await expect(service.findAll(paginationOptions)).rejects.toThrow(InternalServerErrorException);
    });
  });

  // --- Test for findOneByKey() ---
  describe('findOneByKey', () => {
    it('should return a configuration if found by key', async () => {
      mockConfigurationRepository.findOne.mockResolvedValue(mockConfiguration);
      const result = await service.findOneByKey(mockConfigurationKey);
      expect(result).toEqual(mockConfiguration);
      expect(mockConfigurationRepository.findOne).toHaveBeenCalledWith({ where: { key: mockConfigurationKey } });
    });

    it('should throw NotFoundException if configuration is not found by key', async () => {
      mockConfigurationRepository.findOne.mockResolvedValue(null);
      await expect(service.findOneByKey('NON_EXISTENT_KEY')).rejects.toThrow(NotFoundException);
    });
  });

  // --- Test for findOneById() ---
  describe('findOneById', () => {
    it('should return a configuration if found by ID', async () => {
      mockConfigurationRepository.findOne.mockResolvedValue(mockConfiguration);
      const result = await service.findOneById(mockConfigurationId);
      expect(result).toEqual(mockConfiguration);
      expect(mockConfigurationRepository.findOne).toHaveBeenCalledWith({ where: { id: mockConfigurationId } });
    });

    it('should throw NotFoundException if configuration is not found by ID', async () => {
      mockConfigurationRepository.findOne.mockResolvedValue(null);
      await expect(service.findOneById('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  // --- Test for update() ---
  describe('update', () => {
    const updateDto: UpdateConfigurationDto = { value: 'Updated Value', is_editable: false };
    
    it('should update and return the configuration', async () => {
      const existingConfig = { ...mockConfiguration }; // Make a copy
      const expectedUpdatedConfig = { ...existingConfig, ...updateDto };
      
      mockConfigurationRepository.findOne.mockResolvedValue(existingConfig); // For findOneById call
      mockConfigurationRepository.save.mockResolvedValue(expectedUpdatedConfig);

      const result = await service.update(mockConfigurationId, updateDto);
      expect(result).toEqual(expectedUpdatedConfig);
      expect(mockConfigurationRepository.findOne).toHaveBeenCalledWith({ where: { id: mockConfigurationId } });
      expect(mockConfigurationRepository.save).toHaveBeenCalledWith(expect.objectContaining(expectedUpdatedConfig));
    });

    it('should throw NotFoundException if configuration to update is not found', async () => {
      mockConfigurationRepository.findOne.mockResolvedValue(null); // findOneById fails
      await expect(service.update('non-existent-uuid', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on repository.save failure during update', async () => {
      mockConfigurationRepository.findOne.mockResolvedValue(mockConfiguration);
      mockConfigurationRepository.save.mockRejectedValue(new Error('DB Save Error'));
      await expect(service.update(mockConfigurationId, updateDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  // --- Test for remove() ---
  describe('remove', () => {
    it('should successfully remove a configuration', async () => {
      mockConfigurationRepository.delete.mockResolvedValue({ affected: 1, raw: [] });
      await expect(service.remove(mockConfigurationId)).resolves.toBeUndefined();
      expect(mockConfigurationRepository.delete).toHaveBeenCalledWith(mockConfigurationId);
    });

    it('should throw NotFoundException if configuration to remove is not found', async () => {
      mockConfigurationRepository.delete.mockResolvedValue({ affected: 0, raw: [] });
      await expect(service.remove('non-existent-uuid')).rejects.toThrow(NotFoundException);
    });
  });
}); 