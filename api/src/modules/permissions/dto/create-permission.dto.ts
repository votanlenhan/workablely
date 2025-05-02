import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    description:
      'The action allowed by the permission (e.g., create, read, manage).',
    example: 'read',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly action: string;

  @ApiProperty({
    description:
      'The subject the action applies to (e.g., User, Show, Role, all).',
    example: 'User',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly subject: string;

  @ApiPropertyOptional({
    description: 'A brief description of the permission.',
    example: 'Allows reading user profiles.',
  })
  @IsString()
  @IsOptional()
  readonly description?: string;
}
