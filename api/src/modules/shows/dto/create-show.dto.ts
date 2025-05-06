import {
  IsUUID,
  IsString,
  IsOptional,
  MaxLength,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  Min,
  IsEnum,
  IsPositive,
} from 'class-validator';
import { ShowStatus } from '../entities/show.entity';

export class CreateShowDto {
  @IsNotEmpty()
  @IsUUID()
  client_id: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  show_type: string; // E.g., Wedding, Event

  @IsNotEmpty()
  @IsDateString()
  start_datetime: string; // ISO 8601 format string

  @IsOptional()
  @IsDateString()
  end_datetime?: string; // ISO 8601 format string

  @IsOptional()
  @IsString()
  location_address?: string;

  @IsOptional()
  @IsString()
  location_details?: string;

  @IsOptional()
  @IsString()
  requirements?: string; // Photographer notes from Manager

  // Status defaults to PENDING in entity, not usually set on creation
  // @IsOptional()
  // @IsEnum(ShowStatus)
  // status?: ShowStatus;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  total_price: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  deposit_amount?: number;

  @IsOptional()
  @IsDateString()
  deposit_date?: string; // YYYY-MM-DD

  // total_collected, amount_due, payment_status are calculated/managed internally

  @IsOptional()
  @IsDateString()
  post_processing_deadline?: string; // YYYY-MM-DD

  // delivered_at, completed_at, cancelled_at, cancellation_reason are set later

  // created_by_user_id will be set by the service based on authenticated user
} 