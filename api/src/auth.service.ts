import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from './modules/users/users.service'; // Correct path
import { User, PlainUser } from './modules/users/entities/user.entity'; // Import PlainUser
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
  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password_hash'> | null> {
    // Call the existing method that finds user by email
    const user = await this.usersService.findOneByEmail(email);

    // --- DEBUG LOG ---
    console.log('[AuthService] Validating user:', email);
    console.log('[AuthService] User found in DB:', user); // Log the whole user object
    if (user) {
      console.log(
        '[AuthService] Password hash from user object:',
        user.password_hash,
      );
    }
    // --- END DEBUG LOG ---

    if (
      user &&
      user.password_hash &&
      (await bcrypt.compare(pass, user.password_hash))
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...userData } = user;
      const result = userData as Omit<User, 'password_hash'>;
      return result;
    }
    console.error(
      '[AuthService] Validation failed: User not found or password mismatch.',
      { email, userExists: !!user },
    );
    return null;
  }

  /**
   * Handles user registration.
   * @param createUserDto Data for the new user.
   * @returns The newly created plain user object (without password hash and methods).
   */
  async signup(createUserDto: CreateUserDto): Promise<PlainUser> {
    // The actual creation and error handling (e.g., email conflict)
    // is handled within the UsersService.createUser method.
    return this.usersService.createUser(createUserDto);
  }

  /**
   * Generates a JWT access token for a given user.
   * @param user The user object (typically after validation).
   * @returns An object containing the access token.
   */
  async login(
    user: PlainUser,
  ): Promise<{ access_token: string }> {
    const payload = { sub: user.id, email: user.email }; // Use 'sub' for user ID as standard practice
    // We can add more claims to the payload if needed, e.g., roles
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // TODO: Implement signup/register method if needed
}
