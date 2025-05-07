import {
  IsUUID,
  IsOptional,
  IsDateString,
  IsEnum,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { AssignmentStatus } from '../entities/equipment-assignment.entity';

export class CreateEquipmentAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  equipment_id: string;

  @IsUUID()
  @IsOptional()
  show_id?: string;

  @IsUUID()
  @IsOptional()
  user_id?: string; // User to whom the equipment is assigned

  // assigned_by_user_id will be taken from the authenticated user in the service

  @IsDateString()
  @IsNotEmpty()
  assignment_date: string; // Changed to string for DTO

  @IsDateString()
  @IsOptional()
  expected_return_date?: string; // Changed to string for DTO

  @IsDateString()
  @IsOptional()
  actual_return_date?: string; // Changed to string for DTO

  @IsEnum(AssignmentStatus)
  @IsOptional()
  status?: AssignmentStatus;

  @IsString()
  @IsOptional()
  notes?: string;
} 