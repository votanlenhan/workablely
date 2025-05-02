import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    description:
      'The action allowed by the permission (e.g., create, read, manage).',
    example: 'read',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly action: string;

  @ApiProperty({
    description:
      'The subject the action applies to (e.g., User, Show, Role, all).',
    example: 'User',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly subject: string;

  @ApiPropertyOptional({
    description: 'A brief description of the permission.',
    example: 'Allows reading user profiles.',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  readonly description?: string;
}
