import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min, ValidateIf, IsNumber } from 'class-validator';

export class CreateMemberEvaluationDto {
  @ApiProperty({
    description: 'ID of the Show for which the evaluation is being made',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsNotEmpty()
  @IsUUID()
  show_id: string;

  @ApiProperty({
    description: 'ID of the User being evaluated',
    example: 'b2c3d4e5-f678-9012-3456-7890abcdef01',
  })
  @IsNotEmpty()
  @IsUUID()
  evaluated_user_id: string;

  // evaluator_user_id will come from the authenticated user (request.user)

  @ApiPropertyOptional({
    description: 'Rating given to the user, from 1 to 10. Optional if only comments are provided.',
    example: 8,
    minimum: 1,
    maximum: 10,
    nullable: true,
    required: false,
  })
  @IsOptional()
  @Min(1)
  @Max(10)
  @ValidateIf((object, value) => value !== null && value !== undefined)
  @IsNumber({}, { message: 'Rating must be a number or null.' })
  rating?: number | null;

  @ApiPropertyOptional({
    description: 'Detailed comments about the user\'s performance. Optional if only rating is provided.',
    example: 'Great teamwork and communication skills.',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString()
  @ValidateIf((object, value) => value !== null && value !== undefined) // only validate if present
  comments?: string | null;

  // evaluation_date will be set by the service or database default
} 