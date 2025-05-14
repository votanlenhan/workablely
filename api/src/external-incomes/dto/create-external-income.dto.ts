import { IsString, IsNumber, IsDate, IsOptional, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateExternalIncomeDto {
  @ApiProperty({ description: 'Description of the external income' })
  @IsString()
  @MaxLength(255)
  description: string;

  @ApiProperty({ description: 'Amount of the external income' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Date of the external income' })
  @IsDate()
  @Type(() => Date)
  income_date: Date;

  @ApiPropertyOptional({ description: 'Source of the external income' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  source?: string;

  @ApiPropertyOptional({ description: 'Additional notes about the external income' })
  @IsString()
  @IsOptional()
  notes?: string;
} 