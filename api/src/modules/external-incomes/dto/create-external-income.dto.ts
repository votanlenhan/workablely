import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsDateString,
  IsOptional,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExternalIncomeDto {
  @ApiProperty({ description: 'Description of the external income', maxLength: 255, example: 'Consulting services Q3' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @ApiProperty({ description: 'Amount of the income', type: 'number', format: 'float', minimum: 0, example: 1500.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ description: 'Date of the income (YYYY-MM-DD)', example: '2024-09-15' })
  @IsDateString()
  @IsNotEmpty()
  income_date: string; // Will be converted to Date in service

  @ApiPropertyOptional({ description: 'Source of the income', maxLength: 255, example: 'Client Corp' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  source?: string;

  @ApiPropertyOptional({ description: 'Additional notes for the income', example: 'Invoice #2024-09-A' })
  @IsOptional()
  @IsString()
  notes?: string;

  // recorded_by_user_id will be set by the service based on the authenticated user
} 