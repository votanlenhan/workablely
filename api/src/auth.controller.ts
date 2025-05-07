import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './auth/guards/local-auth.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { LoginDto } from './auth/dto/login.dto'; // Correct path from src/
import { CreateUserDto } from './modules/users/dto/create-user.dto'; // Import CreateUserDto
import { User, PlainUser } from './modules/users/entities/user.entity'; // Import User and PlainUser

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Handles user login requests.
   * Applies the LocalAuthGuard to authenticate using email and password.
   * If authentication succeeds, generates and returns a JWT.
   * @param req The request object, populated with the user by LocalAuthGuard.
   * @param loginDto The login credentials (validated by a potential pipe later).
   * @returns An object containing the access token.
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK) // Added HttpCode decorator for 200 OK
  async login(
    @Request() req,
    @Body() loginDto: LoginDto,
  ): Promise<{ access_token: string }> {
    // req.user is populated by the LocalStrategy after successful validation
    // We pass the validated user (without password) to the login service method
    return this.authService.login(req.user);
  }

  /**
   * Retrieves the profile of the currently authenticated user.
   * Applies the JwtAuthGuard to ensure the request has a valid JWT.
   * @param req The request object, populated with the JWT payload (or user object) by JwtStrategy.
   * @returns The user profile information (from the JWT payload).
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // req.user contains the payload validated by JwtStrategy
    return req.user;
  }

  /**
   * Handles user registration requests.
   * Validates input using CreateUserDto and the global ValidationPipe.
   * Calls AuthService to create the new user.
   * @param createUserDto User registration data.
   * @returns The newly created plain user object (without password hash and methods).
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED) // Set response code to 201 Created
  async signup(@Body() createUserDto: CreateUserDto): Promise<PlainUser> {
    return this.authService.signup(createUserDto);
  }

  // TODO: Add signup/register endpoint if needed
}
