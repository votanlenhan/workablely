import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    description: 'The unique name of the role.',
    example: 'Manager',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly name: string;

  @ApiPropertyOptional({
    description: 'A brief description of the role.',
    example: 'Manages shows and financial entries.',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  readonly description?: string;

  @ApiPropertyOptional({
    description: 'An array of permission UUIDs to assign to this role.',
    type: [String],
    format: 'uuid',
    example: [
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    ],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  readonly permissionIds?: string[];
}
