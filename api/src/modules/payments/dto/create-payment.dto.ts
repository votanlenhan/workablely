import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID of the show this payment is for', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @IsUUID()
  @IsNotEmpty()
  show_id: string;

  @ApiProperty({ description: 'Payment amount', example: 150.75, type: Number })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ description: 'Date of the payment', example: '2024-07-31T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  payment_date?: string;

  @ApiPropertyOptional({ description: 'Payment method (e.g., Cash, Bank Transfer, Credit Card)', example: 'Credit Card', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  payment_method?: string;

  @ApiPropertyOptional({ description: 'Transaction reference number or ID', example: 'TXN12345ABC', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  transaction_reference?: string;

  @ApiPropertyOptional({ description: 'Additional notes for the payment', example: 'Payment for second installment' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Is this payment a deposit?', example: false, default: false })
  @IsOptional()
  @IsBoolean()
  is_deposit?: boolean;

  @ApiPropertyOptional({ description: 'ID of the user who recorded this payment', example: 'f0e1d2c3-b4a5-6789-0123-456789abcdef' })
  @IsOptional()
  @IsUUID()
  recorded_by_user_id?: string;
} 