import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  readonly first_name: string;

  @IsString()
  @IsNotEmpty()
  readonly last_name: string;

  @IsString()
  @IsOptional()
  readonly phone_number?: string;

  @IsOptional()
  readonly is_active?: boolean = true; // Usually true by default

  @ApiPropertyOptional({
    description: 'Array of role IDs to assign to the new user.',
    type: [String],
    format: 'uuid',
    example: ['d290f1ee-6c54-4b01-90e6-d701748f0851'],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  readonly roleIds?: string[];

  // avatar_url will likely be handled separately (e.g., after upload)
}
