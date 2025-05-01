import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from './modules/users/users.service'; // Correct path
import { User } from './modules/users/entities/user.entity';
import { CreateUserDto } from './modules/users/dto/create-user.dto'; // Correct path

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates a user based on email and password.
   * @param email The user's email.
   * @param pass The user's password.
   * @returns The validated user object without the password hash, or null if validation fails.
   */
  async validateUser(email: string, pass: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && await bcrypt.compare(pass, user.password_hash)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...userData } = user;
      // Explicitly cast the result to bypass strict type checking issues with entity methods
      const result = userData as Omit<User, 'password_hash'>;
      return result;
    }
    return null;
  }

  /**
   * Handles user registration.
   * @param createUserDto Data for the new user.
   * @returns The newly created user object (without password hash).
   */
  async signup(createUserDto: CreateUserDto): Promise<Omit<User, 'password_hash'>> {
    // The actual creation and error handling (e.g., email conflict)
    // is handled within the UsersService.createUser method.
    return this.usersService.createUser(createUserDto);
  }

  /**
   * Generates a JWT access token for a given user.
   * @param user The user object (typically after validation).
   * @returns An object containing the access token.
   */
  async login(user: Omit<User, 'password_hash'>): Promise<{ access_token: string }> {
    const payload = { sub: user.id, email: user.email }; // Use 'sub' for user ID as standard practice
    // We can add more claims to the payload if needed, e.g., roles
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // TODO: Implement signup/register method if needed
}
