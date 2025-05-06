import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/modules/users/users.service';
import { User } from '@/modules/users/entities/user.entity';

// Define the structure of the JWT payload we expect
interface JwtPayload {
  sub: string; // User ID
  email: string;
  // roles?: string[]; // If roles are directly in JWT, but better to fetch fresh from DB
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  /**
   * Validates the payload extracted from the JWT.
   * Called automatically by Passport after verifying the token's signature and expiration.
   * The return value is attached to the request object as `req.user`.
   * @param payload The decoded JWT payload.
   * @returns The payload itself (or potentially a fetched user object if needed).
   */
  async validate(payload: JwtPayload): Promise<User> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token: Missing user identifier');
    }

    // Fetch the full user object from the database, including roles
    // The second argument to findOneById is 'includePasswordHash: boolean', not relations.
    // findOneById itself handles joining roles.
    const user = await this.usersService.findOneById(payload.sub);

    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found, inactive, or token mismatch');
    }

    // Exclude password_hash from the object attached to req.user for security
    // The User entity itself might have @Exclude on password_hash for serialization,
    // but explicitly omitting it here is safer if not.
    // However, for simplicity now, we return the full user object as fetched.
    // If RolesGuard needs it, it will be there. Consider a PlainUser type if sensitive info is an issue.
    return user;
  }
}
