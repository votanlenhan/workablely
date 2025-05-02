import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePermissionDto {
  @ApiPropertyOptional({
    description: 'An updated description for the permission.',
    example: 'Allows reading basic user profile information only.',
  })
  @IsString()
  @IsOptional()
  readonly description?: string;

  // Note: action and subject are typically immutable for a permission.
  // If they need to change, it's usually better to delete and recreate.
}
