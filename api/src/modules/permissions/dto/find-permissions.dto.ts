import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindPermissionsDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    type: Number,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number) // Ensure transformation from string query param
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    type: Number,
    default: 10,
    maximum: 100, // Documenting the controller's limit
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Add validation for max limit
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter by permission action name',
    type: String,
    example: 'manage',
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({
    description: 'Filter by permission subject name',
    type: String,
    example: 'all',
  })
  @IsOptional()
  @IsString()
  subject?: string;
} 