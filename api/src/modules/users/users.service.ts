import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly saltRounds = 10; // Or read from config

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Creates a new user with a hashed password.
   * @param createUserDto Data for the new user.
   * @returns The created user object without the password hash.
   * @throws ConflictException if email already exists.
   * @throws InternalServerErrorException on database error.
   */
  async createUser(createUserDto: CreateUserDto): Promise<Omit<User, 'password_hash'>> {
    const { email, password, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // Create and save user
    const newUser = this.userRepository.create({
      ...userData,
      email,
      password_hash: hashedPassword,
    });

    try {
      const savedUser = await this.userRepository.save(newUser);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...savedUserData } = savedUser;
      // Explicitly cast the result
      const result = savedUserData as Omit<User, 'password_hash'>;
      return result;
    } catch (error) {
      // Handle potential database errors (e.g., unique constraint violation)
      // You might want more specific error handling based on DB error codes
      throw new InternalServerErrorException('Could not create user');
    }
  }

  // TODO: Add other CRUD methods (findAll, findOneById, update, remove)
}
