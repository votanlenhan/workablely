import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ConfirmationStatus } from '../entities/show-assignment.entity';

export class CreateShowAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  readonly showId: string;

  @IsUUID()
  @IsNotEmpty()
  readonly userId: string;

  @IsUUID()
  @IsNotEmpty()
  readonly showRoleId: string;

  // confirmationStatus defaults to Pending in entity, not required here

  // assignedByUserId should be set by the system/logged-in user, not DTO
} 