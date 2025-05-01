import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module'; // Correct path
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './auth/strategies/local.strategy'; // Correct path
import { JwtStrategy } from './auth/strategies/jwt.strategy'; // Correct path

@Module({
  imports: [
    forwardRef(() => UsersModule), // Use forwardRef for UsersModule
    PassportModule, // Import PassportModule
    ConfigModule, // Import ConfigModule to access environment variables
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  // Provide AuthService, LocalStrategy, JwtStrategy
  providers: [AuthService, LocalStrategy, JwtStrategy], // Add strategies to providers
  exports: [AuthService], // Export AuthService if needed elsewhere
})
export class AuthModule {}
