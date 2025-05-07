import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsDateString,
  IsBoolean,
  IsOptional,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ description: 'Description of the expense', maxLength: 255, example: 'Lunch meeting with client' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @ApiProperty({ description: 'Amount of the expense', type: 'number', format: 'float', minimum: 0, example: 50.75 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ description: 'Date of the expense (YYYY-MM-DD)', example: '2024-07-28' })
  @IsDateString()
  @IsNotEmpty()
  expense_date: string; // Will be converted to Date in service

  @ApiProperty({ description: 'Category of the expense', maxLength: 100, example: 'Meals' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string;

  @ApiPropertyOptional({ description: 'Is this a wishlist expense?', default: false, example: false })
  @IsBoolean()
  @IsOptional()
  is_wishlist_expense?: boolean;

  @ApiPropertyOptional({ description: 'Payment method used', maxLength: 100, example: 'Credit Card' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  payment_method?: string;

  @ApiPropertyOptional({ description: 'Vendor or store name', maxLength: 255, example: 'The Corner Cafe' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  vendor?: string;

  @ApiPropertyOptional({ description: 'URL to the receipt image/document', maxLength: 2048, example: 'https://example.com/receipt.jpg' })
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  receipt_url?: string;

  @ApiPropertyOptional({ description: 'Additional notes for the expense', example: 'Discussed Q3 project milestones' })
  @IsString()
  @IsOptional()
  notes?: string;

  // recorded_by_user_id will be set from the authenticated user in the service
} 