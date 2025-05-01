import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users/entities/user.entity';
import { CreateUserDto } from './users/dto/create-user.dto';
// TODO: Import UpdateUserDto later

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Creates a new user.
   * Handles potential email conflicts and password hashing.
   * @param createUserDto Data for the new user.
   * @returns The newly created user object data (without password hash).
   */
  async createUser(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const { email, password, first_name, last_name, ...otherOptions } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Create new user instance (password will be hashed by @BeforeInsert)
    const newUser = this.userRepository.create({
      email,
      password_hash: password, // Pass plain password here, it will be hashed
      first_name,
      last_name,
      ...otherOptions,
    });

    try {
      const savedUser = await this.userRepository.save(newUser);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...userData } = savedUser;
      return userData;
    } catch (error) {
      // Handle potential database errors (e.g., unique constraint violation if check above failed somehow)
      // TODO: Add more specific error handling if needed
      throw new InternalServerErrorException('Could not create user');
    }
  }

  /**
   * Finds a single user by their email, including the password hash.
   * Essential for authentication validation.
   * @param email The email of the user to find.
   * @returns The user object including the password hash, or null if not found.
   */
  async findOneByEmail(email: string): Promise<User | null> {
    console.log(`[UsersService] Finding user by email: ${email}`);
    const user = await this.userRepository.createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.email = :email', { email })
      .getOne();

    console.log('[UsersService] User found:', user); // Log result inside service
    if (user) {
        console.log('[UsersService] Password hash from found user:', user.password_hash);
    }

    return user;
  }

  /**
   * Finds a single user by ID (excluding password hash by default).
   * @param id The UUID of the user.
   * @returns The user object or throws NotFoundException.
   */
  async findOneById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  /**
   * Finds all users (consider adding pagination later).
   * Excludes password hash by default.
   * @returns An array of users.
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // TODO: Implement update(id, updateUserDto)

  // TODO: Implement remove(id)
}
