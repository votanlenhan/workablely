import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
  MaxLength,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { EquipmentStatus } from '../entities/equipment.entity';

export class CreateEquipmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  serial_number?: string;

  @IsDateString()
  @IsOptional()
  purchase_date?: string; // Changed to string for DTO, will be Date in entity

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  purchase_price?: number;

  @IsEnum(EquipmentStatus)
  @IsOptional()
  status?: EquipmentStatus;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsString()
  @IsOptional()
  notes?: string;
} 