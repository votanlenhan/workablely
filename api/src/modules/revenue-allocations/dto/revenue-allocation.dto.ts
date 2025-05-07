import { ApiProperty } from '@nestjs/swagger';
import { PlainUser } from '../../users/entities/user.entity'; // Changed import
import { ShowRole } from '../../show-roles/entities/show-role.entity'; // Changed import
// import { ConfigurationValueType } from '../../configurations/entities/configuration-value-type.enum'; // This import seems unused, commented out.

export class RevenueAllocationDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  show_id: string;

  @ApiProperty({ 
    // type: 'object', // Temporarily removed to check TS2322 error
    required: false, 
    description: 'User who receives this allocation, if applicable.'
    // One day, consider using schema: { $ref: getSchemaPath(PlainUser) } if PlainUser becomes a class or if more detail is needed
  })
  user?: PlainUser; // Embed basic user info, changed type

  @ApiProperty({ example: 'Key Photographer' })
  allocated_role_name: string;

  @ApiProperty({ type: () => ShowRole, required: false, description: 'Specific show role this allocation applies to, if any.' })
  show_role?: ShowRole; // Embed basic show role info, changed type

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