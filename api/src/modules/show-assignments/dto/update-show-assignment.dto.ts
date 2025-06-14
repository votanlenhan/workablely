import { PartialType } from '@nestjs/mapped-types';
import { CreateShowAssignmentDto } from './create-show-assignment.dto';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ConfirmationStatus } from '../entities/show-assignment.entity';

// We don't typically allow changing show_id, user_id, or show_role_id after creation.
// This DTO focuses on updating status or potentially decline reason.

export class UpdateShowAssignmentDto extends PartialType(CreateShowAssignmentDto) {
  // Allow updating status or decline reason
  @IsOptional()
  @IsEnum(ConfirmationStatus)
  readonly confirmationStatus?: ConfirmationStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  readonly declineReason?: string;

  // Consider if assignedBy should be updatable - likely not
  // Consider if showId, userId, showRoleId should be updatable - likely not, delete and create new instead
} 