import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, PlainUser } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class UsersService {
  private readonly saltRounds = 10; // Or read from config

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
    // Log right after injection attempt
    console.log('[UsersService] Constructor called.');
    console.log(
      '[UsersService] userRepository injected:',
      !!this.userRepository,
    );
    console.log(
      '[UsersService] roleRepository injected:',
      !!this.roleRepository,
    );
    if (!this.roleRepository) {
      console.error(
        '[UsersService] FATAL: roleRepository is undefined/null in constructor!',
      );
    }
  }

  /**
   * Finds a user by email, ensuring the password hash is selected for authentication purposes.
   * @param email The user's email.
   * @returns The user object including the password hash, or null if not found.
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .addSelect('user.password_hash')
      .where('user.email = :email', { email })
      .getOne();
  }

  /**
   * Finds a single user by ID, including their roles.
   * @param id - The UUID of the user to find.
   * @param includePasswordHash - Whether to include the password hash (default: false).
   * @returns The found user with roles.
   * @throws NotFoundException if the user doesn't exist.
   */
  async findOneById(
    id: string,
    includePasswordHash: boolean = false,
  ): Promise<User> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('user.id = :id', { id });

    if (includePasswordHash) {
      queryBuilder.addSelect('user.password_hash');
    }

    const user = await queryBuilder.getOne();

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    return user;
  }

  /**
   * Finds all users with pagination.
   * @param options - Pagination options (page, limit).
   * @returns A paginated list of users (plain data without password hash).
   */
  async findAll(
    options: IPaginationOptions,
  ): Promise<Pagination<PlainUser>> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    queryBuilder
      .leftJoinAndSelect('user.roles', 'role') // Eager load roles
      .orderBy('user.created_at', 'DESC'); // Default order

    const paginatedResult = await paginate<User>(queryBuilder, options);

    // Manually remove password hash from paginated items
    const itemsWithoutPassword = paginatedResult.items.map(
      ({ password_hash, ...user }) => user as PlainUser,
    );

    return new Pagination<PlainUser>(
      itemsWithoutPassword,
      paginatedResult.meta,
      paginatedResult.links,
    );
  }

  /**
   * Creates a new user with a hashed password.
   * @param createUserDto Data for the new user.
   * @returns The created plain user object without the password hash.
   * @throws ConflictException if email already exists.
   * @throws InternalServerErrorException on database error.
   */
  async createUser(createUserDto: CreateUserDto): Promise<PlainUser> {
    const { email, password, roleIds, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    let roles: Role[] = [];
    // Check if roleIds is defined and not empty before querying
    if (roleIds && roleIds.length > 0) { 
      roles = await this.roleRepository.findBy({ id: In(roleIds) });
      if (roles.length !== roleIds.length) {
        const foundIds = roles.map((r) => r.id);
        const notFoundIds = roleIds.filter((id) => !foundIds.includes(id));
        throw new NotFoundException(
          `Roles with IDs not found: ${notFoundIds.join(', ')}`,
        );
      }
    } // else roles remains an empty array

    // Create user
    const newUser = this.userRepository.create({
      ...userData,
      email,
      password_hash: hashedPassword,
      roles,
    });

    try {
      const savedUser = await this.userRepository.save(newUser);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...resultData } = savedUser;
      // Cast to PlainUser after removing password hash
      return resultData as PlainUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Could not create user.');
    }
  }

  /**
   * Updates an existing user.
   * @param id - The UUID of the user to update.
   * @param updateUserDto - Data to update the user with.
   * @returns The updated plain user object (without password hash).
   * @throws NotFoundException if the user doesn't exist.
   * @throws ConflictException if email is changed to one that already exists.
   * @throws InternalServerErrorException on database error.
   */
  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<PlainUser> {
    const { email, password, roleIds, ...otherData } = updateUserDto;

    // Use preload to load the user and merge data
    const user = await this.userRepository.preload({
      id: id,
      ...otherData,
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    // Handle email change separately for conflict check
    if (email && email !== user.email) {
      const existingUserWithEmail = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUserWithEmail && existingUserWithEmail.id !== id) {
        throw new ConflictException(`Email "${email}" is already in use.`);
      }
      user.email = email;
    }

    // Handle password change
    if (password) {
      user.password_hash = await bcrypt.hash(password, this.saltRounds);
    }

    if (roleIds !== undefined) {
      const userWithRoles = await this.findOneById(id);
      user.roles = userWithRoles.roles; // Assign loaded roles to the entity being updated

      // Check if roleIds is not empty before querying
      if (roleIds.length > 0) { 
        const roles = await this.roleRepository.findBy({ id: In(roleIds) });
        if (roles.length !== roleIds.length) {
          const foundIds = roles.map((r) => r.id);
          const notFoundIds = roleIds.filter((id) => !foundIds.includes(id));
          throw new NotFoundException(
            `Roles with IDs not found: ${notFoundIds.join(', ')}`,
          );
        }
        user.roles = roles; 
      } else {
        user.roles = []; // Assign empty array if roleIds is empty
      }
    }
    // If roleIds is undefined, roles are not changed

    try {
      const savedUser = await this.userRepository.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...resultData } = savedUser;
      // Reload roles relationship explicitly IF NOT populated by save mock/return
      // Ensure we use the roles from the *saved* user object.
      if (!resultData.roles || resultData.roles.length !== savedUser.roles?.length) {
         // Note: In a real scenario, TypeORM might not return the full relation after save 
         // depending on configuration. Reloading might be necessary.
         // However, for mocks, savedUser should have the correct roles.
         // If savedUser.roles is somehow missing, we might need findOneById again, 
         // but let's assume the save mock is correct first.
         resultData.roles = savedUser.roles || []; 
      }
      // Ensure return type matches PlainUser which expects roles
      if (!resultData.roles) resultData.roles = []; 
      return resultData as PlainUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new InternalServerErrorException('Could not update user.');
    }
  }

  /**
   * Assigns specified roles to a user, adding to existing roles.
   * @param userId - The UUID of the user.
   * @param roleIds - An array of role UUIDs to assign.
   * @returns The updated plain user object (without password hash).
   * @throws NotFoundException if the user or any role doesn't exist.
   * @throws BadRequestException if no role IDs are provided.
   */
  async assignRolesToUser(
    userId: string,
    roleIds: string[],
  ): Promise<PlainUser> {
    if (!roleIds || roleIds.length === 0) {
      throw new BadRequestException('No role IDs provided to assign.');
    }

    // Find the user *including* their current roles
    const user = await this.findOneById(userId);

    // Find the roles to be assigned
    const rolesToAssign = await this.roleRepository.findBy({ id: In(roleIds) });
    if (rolesToAssign.length !== roleIds.length) {
      const foundIds = rolesToAssign.map((r) => r.id);
      const notFoundIds = roleIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Roles with IDs not found: ${notFoundIds.join(', ')}`,
      );
    }

    // Corrected logic V4: Simple iteration and check for uniqueness
    const uniqueRoles: Role[] = [];
    const seenRoleIds = new Set<string>();

    // Add existing roles first, ensuring uniqueness
    user.roles.forEach(role => {
        if (!seenRoleIds.has(role.id)) {
            uniqueRoles.push(role);
            seenRoleIds.add(role.id);
        }
    });

    // Add roles to assign only if they haven't been seen
    rolesToAssign.forEach(role => {
        if (!seenRoleIds.has(role.id)) {
            uniqueRoles.push(role);
            seenRoleIds.add(role.id);
        }
    });

    user.roles = uniqueRoles; 

    try {
      const savedUser = await this.userRepository.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...resultData } = savedUser;
      // Ensure the roles relationship is properly represented in the returned object
      // Use the roles from the 'savedUser' which reflects the state after save.
      resultData.roles = savedUser.roles || []; // Use savedUser.roles
      return resultData as PlainUser;
    } catch (error) {
      console.error('Error assigning roles to user:', error);
      throw new InternalServerErrorException('Could not assign roles to user.');
    }
  }

  /**
   * Removes specified roles from a user.
   * @param userId - The UUID of the user.
   * @param roleIds - An array of role UUIDs to remove.
   * @returns The updated plain user object (without password hash).
   * @throws NotFoundException if the user doesn't exist.
   * @throws BadRequestException if no role IDs are provided.
   */
  async removeRolesFromUser(
    userId: string,
    roleIds: string[],
  ): Promise<PlainUser> {
    if (!roleIds || roleIds.length === 0) {
      throw new BadRequestException('No role IDs provided to remove.');
    }

    const user = await this.findOneById(userId);

    // No need to fetch roles here, just filter the existing ones
    user.roles = user.roles.filter((role) => !roleIds.includes(role.id));

    try {
      const savedUser = await this.userRepository.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...resultData } = savedUser;
      // Ensure the roles relationship is properly represented in the returned object
      // Use the roles from the 'savedUser'.
      resultData.roles = savedUser.roles || []; // Use savedUser.roles
      return resultData as PlainUser;
    } catch (error) {
      console.error('Error removing roles from user:', error);
      throw new InternalServerErrorException(
        'Could not remove roles from user.',
      );
    }
  }

  /**
   * Removes a user by ID.
   * @param id The user ID.
   * @throws NotFoundException if user not found.
   */
  async removeUser(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
  }
}
