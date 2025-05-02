import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

// Inherit validation rules from CreateUserDto, but make all fields optional.
export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Override password to make MinLength optional if password is provided
  @ApiPropertyOptional({
    description:
      'User password (at least 8 characters). Only include if changing the password.',
    minLength: 8,
    example: 'newSecurePassword123',
  })
  @IsString()
  @MinLength(8)
  @IsOptional() // Make password optional for updates
  readonly password?: string;

  // roleIds is already optional from CreateUserDto via PartialType
}
