import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Define the structure of the JWT payload we expect
interface JwtPayload {
  sub: string; // User ID
  email: string;
  // Add other claims if included during login (e.g., roles)
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract token from Authorization header
      ignoreExpiration: false, // Ensure token is not expired
      secretOrKey: configService.get<string>('JWT_SECRET')!, // Use the same secret as in AuthModule
    });
  }

  /**
   * Validates the payload extracted from the JWT.
   * Called automatically by Passport after verifying the token's signature and expiration.
   * The return value is attached to the request object as `req.user`.
   * @param payload The decoded JWT payload.
   * @returns The payload itself (or potentially a fetched user object if needed).
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Here, we trust the payload because the token signature is already verified.
    // We could perform additional checks, e.g., query the DB to ensure the user still exists or isn't blocked.
    // For now, simply return the payload.
    if (!payload || !payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }
    // You might want to fetch the full user object here based on payload.sub
    // const user = await this.usersService.findOneById(payload.sub); // Requires adding findOneById to UsersService
    // if (!user || !user.is_active) {
    //   throw new UnauthorizedException('User not found or inactive');
    // }
    // return user; // Return full user object if fetched

    return payload; // Return the validated payload
  }
} 