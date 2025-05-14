import { IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAuditLogsDto {
  @IsOptional()
  @IsString()
  entity_name?: string;

  @IsOptional()
  @IsUUID()
  entity_id?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsUUID()
  changed_by_user_id?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
} 