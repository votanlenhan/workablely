import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuration } from './entities/configuration.entity';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { paginate, Pagination, IPaginationOptions } from 'nestjs-typeorm-paginate';

@Injectable()
export class ConfigurationsService {
  private readonly logger = new Logger(ConfigurationsService.name);

  constructor(
    @InjectRepository(Configuration)
    private readonly configurationRepository: Repository<Configuration>,
  ) {}

  /**
   * Creates a new configuration entry.
   * @param createConfigurationDto DTO for creating a configuration.
   * @returns The created configuration entry.
   * @throws ConflictException if a configuration with the same key already exists.
   */
  async create(createConfigurationDto: CreateConfigurationDto): Promise<Configuration> {
    const { key } = createConfigurationDto;
    const existingConfig = await this.configurationRepository.findOne({ where: { key } });
    if (existingConfig) {
      throw new ConflictException(`Configuration with key '${key}' already exists.`);
    }

    try {
      const newConfig = this.configurationRepository.create(createConfigurationDto);
      return await this.configurationRepository.save(newConfig);
    } catch (error) {
      this.logger.error(`Failed to create configuration for key '${key}': ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create configuration.');
    }
  }

  /**
   * Retrieves all configurations with pagination.
   * @param options Pagination options.
   * @returns Paginated list of configurations.
   */
  async findAll(options: IPaginationOptions): Promise<Pagination<Configuration>> {
    try {
      return await paginate<Configuration>(this.configurationRepository, options);
    } catch (error) {
      this.logger.error(`Failed to retrieve configurations: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve configurations.');
    }
  }

  /**
   * Retrieves a single configuration by its key.
   * @param key The key of the configuration to retrieve.
   * @returns The found configuration entry.
   * @throws NotFoundException if the configuration with the given key is not found.
   */
  async findOneByKey(key: string): Promise<Configuration> {
    const config = await this.configurationRepository.findOne({ where: { key } });
    if (!config) {
      throw new NotFoundException(`Configuration with key '${key}' not found.`);
    }
    return config;
  }
  
  /**
   * Retrieves a single configuration by its ID.
   * @param id The ID of the configuration to retrieve.
   * @returns The found configuration entry.
   * @throws NotFoundException if the configuration with the given ID is not found.
   */
  async findOneById(id: string): Promise<Configuration> {
    const config = await this.configurationRepository.findOne({ where: { id } });
    if (!config) {
      throw new NotFoundException(`Configuration with ID '${id}' not found.`);
    }
    return config;
  }

  /**
   * Updates an existing configuration by its ID.
   * @param id The ID of the configuration to update.
   * @param updateConfigurationDto DTO for updating a configuration.
   * @returns The updated configuration entry.
   * @throws NotFoundException if the configuration is not found.
   * @throws ConflictException if trying to update key to one that already exists (though key is not updatable via DTO).
   */
  async update(id: string, updateConfigurationDto: UpdateConfigurationDto): Promise<Configuration> {
    const configToUpdate = await this.findOneById(id);
    // `key` is not in UpdateConfigurationDto, so no need to check for key conflicts here.

    try {
      const updated = await this.configurationRepository.save({
        ...configToUpdate, 
        ...updateConfigurationDto,
      });
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update configuration with ID '${id}': ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update configuration.');
    }
  }

  /**
   * Removes a configuration by its ID.
   * @param id The ID of the configuration to remove.
   * @throws NotFoundException if the configuration is not found.
   */
  async remove(id: string): Promise<void> {
    const result = await this.configurationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Configuration with ID '${id}' not found.`);
    }
  }
} 