import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationsController } from './configurations.controller';
import { ConfigurationsService } from './configurations.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { Configuration } from './entities/configuration.entity';
import { ConfigurationValueType } from './entities/configuration-value-type.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { RoleName } from '../roles/entities/role.entity';
import { CanActivate, HttpStatus } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';

const mockConfigurationId = 'cfg-ctrl-uuid-1';
const mockConfigurationKey = 'CTRL_TEST_KEY';

const mockConfiguration: Configuration = {
  id: mockConfigurationId,
  key: mockConfigurationKey,
  value: 'Controller Test Value',
  value_type: ConfigurationValueType.STRING,
  created_at: new Date(),
  updated_at: new Date(),
  is_editable: true,
  description: 'Controller test description'
};

const mockConfigurationsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOneByKey: jest.fn(),
  findOneById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock Guards
const mockJwtAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };
const mockRolesGuard: CanActivate = { canActivate: jest.fn(() => true) };

describe('ConfigurationsController', () => {
  let controller: ConfigurationsController;
  let service: ConfigurationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigurationsController],
      providers: [
        {
          provide: ConfigurationsService,
          useValue: mockConfigurationsService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard).useValue(mockJwtAuthGuard)
    .overrideGuard(RolesGuard).useValue(mockRolesGuard)
    .compile();

    controller = module.get<ConfigurationsController>(ConfigurationsController);
    service = module.get<ConfigurationsService>(ConfigurationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateConfigurationDto = {
      key: 'NEW_KEY_CTRL',
      value: 'New Value from Controller',
      value_type: ConfigurationValueType.BOOLEAN,
      is_editable: false
    };
    it('should call service.create and return the result', async () => {
      mockConfigurationsService.create.mockResolvedValue(mockConfiguration as any);
      const result = await controller.create(createDto);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockConfiguration);
    });
  });

  describe('findAll', () => {
    const paginatedResult: Pagination<Configuration> = {
      items: [mockConfiguration],
      meta: { totalItems: 1, itemCount: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
      links: { first: '', previous: '', next: '', last: '' },
    };
    it('should call service.findAll and return paginated results', async () => {
      mockConfigurationsService.findAll.mockResolvedValue(paginatedResult as any);
      const page = 1, limit = 10;
      const result = await controller.findAll(page, limit);
      expect(service.findAll).toHaveBeenCalledWith({ page, limit, route: 'configurations' });
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOneByKey', () => {
    it('should call service.findOneByKey and return the result', async () => {
      mockConfigurationsService.findOneByKey.mockResolvedValue(mockConfiguration as any);
      const result = await controller.findOneByKey(mockConfigurationKey);
      expect(service.findOneByKey).toHaveBeenCalledWith(mockConfigurationKey);
      expect(result).toEqual(mockConfiguration);
    });
  });
  
  describe('findOneById', () => {
    it('should call service.findOneById and return the result', async () => {
      mockConfigurationsService.findOneById.mockResolvedValue(mockConfiguration as any);
      const result = await controller.findOneById(mockConfigurationId);
      expect(service.findOneById).toHaveBeenCalledWith(mockConfigurationId);
      expect(result).toEqual(mockConfiguration);
    });
  });

  describe('update', () => {
    const updateDto: UpdateConfigurationDto = { value: 'Updated Value by Controller' };
    it('should call service.update and return the result', async () => {
      const updatedConfiguration = { ...mockConfiguration, ...updateDto };
      // Mock findOneById for the check within controller.update
      mockConfigurationsService.findOneById.mockResolvedValue(mockConfiguration as any);
      mockConfigurationsService.update.mockResolvedValue(updatedConfiguration as any);
      
      const result = await controller.update(mockConfigurationId, updateDto);
      expect(service.findOneById).toHaveBeenCalledWith(mockConfigurationId); // Check the guard call
      expect(service.update).toHaveBeenCalledWith(mockConfigurationId, updateDto);
      expect(result).toEqual(updatedConfiguration);
    });

    it('should allow update if config is_editable = true', async () => {
      const editableConfig = { ...mockConfiguration, is_editable: true };
      mockConfigurationsService.findOneById.mockResolvedValue(editableConfig as any);
      mockConfigurationsService.update.mockResolvedValue({ ...editableConfig, ...updateDto } as any);
      await controller.update(mockConfigurationId, updateDto);
      expect(service.update).toHaveBeenCalledWith(mockConfigurationId, updateDto);
    });

    // This test depends on how you decide to handle updates to non-editable configs by Admins.
    // The current controller logic allows it. If it were to throw, this test would change.
    it('should allow admin to update even if config is_editable = false (current controller logic)', async () => {
      const nonEditableConfig = { ...mockConfiguration, is_editable: false };
      mockConfigurationsService.findOneById.mockResolvedValue(nonEditableConfig as any);
      mockConfigurationsService.update.mockResolvedValue({ ...nonEditableConfig, ...updateDto } as any);
      await controller.update(mockConfigurationId, updateDto);
      expect(service.update).toHaveBeenCalledWith(mockConfigurationId, updateDto);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      mockConfigurationsService.remove.mockResolvedValue(undefined); // remove returns void
      await controller.remove(mockConfigurationId);
      expect(service.remove).toHaveBeenCalledWith(mockConfigurationId);
    });
  });
}); 