import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Creates a new permission.
   * @param createPermissionDto - Data for the new permission.
   * @returns The newly created permission.
   * @throws ConflictException if a permission with the same action and subject already exists.
   * @throws InternalServerErrorException on database error.
   */
  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const { action, subject } = createPermissionDto;

    // Check for existing permission with the same action and subject
    const existingPermission = await this.permissionRepository.findOne({
      where: { action, subject },
    });
    if (existingPermission) {
      throw new ConflictException(
        `Permission with action "${action}" and subject "${subject}" already exists.`,
      );
    }

    const newPermission = this.permissionRepository.create(createPermissionDto);

    try {
      return await this.permissionRepository.save(newPermission);
    } catch (error) {
      // Log the error for debugging
      console.error('Error creating permission:', error);
      // Handle potential unique constraint violation if check above fails somehow
      if (error.code === '23505') {
        // Unique violation error code for PostgreSQL
        throw new ConflictException(
          `Permission with action "${action}" and subject "${subject}" already exists.`,
        );
      }
      throw new InternalServerErrorException('Could not create permission.');
    }
  }

  /**
   * Finds all permissions.
   * @returns A list of all permissions.
   */
  async findAll(): Promise<Permission[]> {
    // Consider adding relations: ['roles'] if needed often
    return this.permissionRepository.find();
  }

  /**
   * Finds a single permission by its ID.
   * @param id - The UUID of the permission to find.
   * @returns The found permission.
   * @throws NotFoundException if the permission doesn't exist.
   */
  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException(`Permission with ID "${id}" not found.`);
    }
    return permission;
  }

  /**
   * Updates the description of an existing permission.
   * @param id - The UUID of the permission to update.
   * @param updatePermissionDto - Data containing the new description.
   * @returns The updated permission.
   * @throws NotFoundException if the permission doesn't exist.
   * @throws InternalServerErrorException on database error.
   */
  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    // Use preload to load the entity and apply the changes
    const permission = await this.permissionRepository.preload({
      id: id,
      ...updatePermissionDto, // Only description should be in updatePermissionDto
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID "${id}" not found.`);
    }

    try {
      return await this.permissionRepository.save(permission);
    } catch (error) {
      console.error('Error updating permission:', error);
      throw new InternalServerErrorException('Could not update permission.');
    }
  }

  /**
   * Removes a permission.
   * @param id - The UUID of the permission to remove.
   * @throws NotFoundException if the permission doesn't exist.
   * @throws InternalServerErrorException on database error.
   */
  async remove(id: string): Promise<void> {
    const result = await this.permissionRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Permission with ID "${id}" not found.`);
    }
    // No return needed for successful deletion
  }
}
