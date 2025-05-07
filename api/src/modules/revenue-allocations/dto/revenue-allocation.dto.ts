import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dto/user.dto'; // Assuming you have a simple UserDto for responses
import { ShowRoleDto } from '../../show-roles/dto/show-role.dto'; // Assuming ShowRoleDto exists
import { ConfigurationValueType } from '../../configurations/entities/configuration-value-type.enum';

export class RevenueAllocationDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  show_id: string;

  @ApiProperty({ type: () => UserDto, required: false, description: 'User who receives this allocation, if applicable.' })
  user?: UserDto; // Embed basic user info

  @ApiProperty({ example: 'Key Photographer' })
  allocated_role_name: string;

  @ApiProperty({ type: () => ShowRoleDto, required: false, description: 'Specific show role this allocation applies to, if any.' })
  show_role?: ShowRoleDto; // Embed basic show role info

  @ApiProperty({ example: 150.75, type: 'number', format: 'float' })
  amount: number;

  @ApiProperty({ example: 'Based on 35% of show price for Key role.', required: false })
  calculation_notes?: string;

  @ApiProperty()
  allocation_datetime: Date;

  @ApiProperty({ example: '2023-01-15T10:30:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2023-01-16T12:00:00.000Z' })
  updated_at: Date;
} 