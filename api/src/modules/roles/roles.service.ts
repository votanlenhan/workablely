import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity'; // Corrected path
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate'; // Import pagination

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission) // Inject Permission repository
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Creates a new role with optional initial permissions.
   * @param createRoleDto - Data for the new role.
   * @returns The newly created role.
   * @throws ConflictException if role name already exists.
   * @throws NotFoundException if any provided permission ID is invalid.
   * @throws InternalServerErrorException on database error.
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, description, permissionIds } = createRoleDto;

    // Check if role name already exists
    const existingRole = await this.roleRepository.findOne({ where: { name } });
    if (existingRole) {
      throw new ConflictException(`Role with name "${name}" already exists.`);
    }

    let permissions: Permission[] = [];
    if (permissionIds && permissionIds.length > 0) {
      permissions = await this.permissionRepository.findBy({ id: In(permissionIds) });
      if (permissions.length !== permissionIds.length) {
        const foundIds = permissions.map((p) => p.id);
        const notFoundIds = permissionIds.filter((pid) => !foundIds.includes(pid));
        throw new NotFoundException(
          `Permissions with IDs not found: ${notFoundIds.join(', ')}`,
        );
      }
    }

    const newRole = this.roleRepository.create({
      name,
      description,
      permissions,
    });

    try {
      return await this.roleRepository.save(newRole);
    } catch (error) {
      // Log the error for debugging
      console.error('Error creating role:', error);
      throw new InternalServerErrorException('Could not create role.');
    }
  }

  /**
   * Finds all roles with pagination and optionally loads permissions.
   * @param options - Pagination options (page, limit).
   * @returns A paginated list of roles.
   */
  async findAll(
    options: IPaginationOptions,
  ): Promise<Pagination<Role>> {
    const queryBuilder = this.roleRepository.createQueryBuilder('role');
    queryBuilder.leftJoinAndSelect('role.permissions', 'permission') // Join and select permissions
                .orderBy('role.name', 'ASC'); // Default order by name

    return paginate<Role>(queryBuilder, options);
  }

  /**
   * Finds a single role by its ID.
   * @param id - The UUID of the role to find.
   * @returns The found role.
   * @throws NotFoundException if the role doesn't exist.
   */
  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'], // Load associated permissions
    });
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found.`);
    }
    return role;
  }

  /**
   * Finds a single role by its name.
   * @param name - The name of the role to find.
   * @returns The found role or null.
   */
  async findOneByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  /**
   * Updates an existing role.
   * @param id - The UUID of the role to update.
   * @param updateRoleDto - Data to update the role with.
   * @returns The updated role.
   * @throws NotFoundException if the role or any provided permission ID doesn't exist.
   * @throws ConflictException if trying to change name to one that already exists.
   * @throws InternalServerErrorException on database error.
   */
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const { name, description, permissionIds } = updateRoleDto;

    // Fetch the role to be updated first, including current permissions
    // This ensures we operate on the actual current state
    const role = await this.findOne(id);
    // findOne already throws NotFoundException if role doesn't exist

    // Apply basic field updates (description)
    if (description !== undefined) {
        role.description = description;
    }

    // Check for name conflict only if name is provided and different
    if (name && name !== role.name) {
      const existingRole = await this.findOneByName(name);
      if (existingRole && existingRole.id !== id) {
        throw new ConflictException(`Role name '${name}' already exists.`);
      }
      role.name = name; // Update name on the fetched entity
    }

    // Handle permission updates only if permissionIds is explicitly provided
    if (permissionIds !== undefined) {
      if (permissionIds.length > 0) {
        const permissions = await this.permissionRepository.findBy({
          id: In(permissionIds),
        });
        // Check if all requested permissions were found
        if (permissions.length !== permissionIds.length) { 
          const foundIds = permissions.map((p) => p.id);
          const notFoundIds = permissionIds.filter(
            (pid) => !foundIds.includes(pid),
          );
          throw new NotFoundException(
            `Permissions with IDs not found: ${notFoundIds.join(', ')}`,
          );
        }
        role.permissions = permissions; // Assign the newly found permissions
      } else {
        // permissionIds is an empty array, so remove all permissions
        role.permissions = [];
      }
    } 
    // If permissionIds is undefined, role.permissions remains untouched

    try {
      // Save the updated role entity (which now has name, desc, permissions updated)
      const updatedRole = await this.roleRepository.save(role);
      return updatedRole;
    } catch (error) {
      // Log error if needed
      throw new InternalServerErrorException('Could not update role.');
    }
  }

  /**
   * Removes a role.
   * @param id - The UUID of the role to remove.
   * @throws NotFoundException if the role doesn't exist.
   * @throws InternalServerErrorException on database error.
   */
  async remove(id: string): Promise<void> {
    const role = await this.findOne(id); // findOne already throws NotFoundException

    // Optional: Add check for is_system_role before deleting
    // if (role.is_system_role) {
    //   throw new ConflictException(`System role "${role.name}" cannot be deleted.`);
    // }

    const result = await this.roleRepository.delete(id);

    if (result.affected === 0) {
      // This case should technically not happen if findOne succeeded, but good practice
      throw new NotFoundException(
        `Role with ID "${id}" not found for deletion.`,
      );
    }
    // No return needed for successful deletion
  }

  // Potential future methods:
  // async assignPermissionToRole(roleId: string, permissionId: string): Promise<Role> { ... }
  // async removePermissionFromRole(roleId: string, permissionId: string): Promise<Role> { ... }
  // async assignRoleToUser(userId: string, roleId: string): Promise<User> { ... } (Likely in UsersService)
  // async removeRoleFromUser(userId: string, roleId: string): Promise<User> { ... } (Likely in UsersService)
}
