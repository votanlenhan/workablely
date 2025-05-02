import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
  IsUUID,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // For API documentation

export class CreateRoleDto {
  @ApiProperty({
    description: 'The unique name of the role.',
    example: 'Content Editor',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly name: string;

  @ApiPropertyOptional({
    description: 'A brief description of the role.',
    example: 'Can create and manage blog posts and pages.',
  })
  @IsString()
  @IsOptional()
  readonly description?: string;

  @ApiPropertyOptional({
    description:
      'Indicates if the role is a system role (cannot be deleted). Defaults to false.',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly is_system_role?: boolean = false;

  @ApiPropertyOptional({
    description: 'Array of permission IDs to assign to this role initially.',
    type: [String],
    format: 'uuid',
    example: [
      'd290f1ee-6c54-4b01-90e6-d701748f0851',
      'd290f1ee-6c54-4b01-90e6-d701748f0852',
    ],
  })
  @IsArray()
  @IsUUID('all', { each: true }) // Validate each element as a UUID
  @IsOptional()
  readonly permissionIds?: string[];
}
