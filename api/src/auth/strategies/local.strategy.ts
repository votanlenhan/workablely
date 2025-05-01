import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth.service'; // Corrected path
import { User } from '../../modules/users/entities/user.entity'; // Relative path

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' }); // Use email as the username field
  }

  /**
   * Validates the user based on the provided email and password.
   * Called automatically by Passport during the local authentication flow.
   * @param email The email provided by the user.
   * @param password The password provided by the user.
   * @returns The validated user object (without password hash).
   * @throws UnauthorizedException if validation fails.
   */
  async validate(email: string, password: string): Promise<Omit<User, 'password_hash'>> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Ensure the return type matches the promise
    return user as Omit<User, 'password_hash'>;
  }
}