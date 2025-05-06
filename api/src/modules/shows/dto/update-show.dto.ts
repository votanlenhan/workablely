import { PartialType } from '@nestjs/mapped-types';
import { CreateShowDto } from './create-show.dto';
import {
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { ShowStatus, ShowPaymentStatus } from '../entities/show.entity';

export class UpdateShowDto extends PartialType(CreateShowDto) {
  // Override fields from CreateShowDto if validation differs on update
  // Or add fields specific to update

  // Allow updating status
  @IsOptional()
  @IsEnum(ShowStatus)
  status?: ShowStatus;

  // Allow updating cancellation reason (only relevant if status is CANCELLED)
  @IsOptional()
  @IsString()
  cancellation_reason?: string;

  @IsOptional()
  @IsDateString()
  delivered_at?: string;

  @IsOptional()
  @IsDateString()
  completed_at?: string;

  @IsOptional()
  @IsDateString()
  cancelled_at?: string;

  // Although payment_status is derived, allow manual override if absolutely necessary?
  // Or handle payment status updates through a dedicated payment recording endpoint.
  // For now, exclude it from direct update via this DTO.
  // @IsOptional()
  // @IsEnum(ShowPaymentStatus)
  // payment_status?: ShowPaymentStatus;

  // created_by_user_id should not be updatable directly here

  // Allow updating client ID, but it must be a valid UUID if provided
  @IsOptional()
  @IsUUID()
  clientId?: string;
} 