import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';

export class UpdateMemberEvaluationDto {
  @ApiPropertyOptional({
    description: 'Updated rating given to the user, from 1 to 10.',
    example: 9,
    minimum: 1,
    maximum: 10,
    nullable: true,
  })
  @IsOptional()
  @Min(1)
  @Max(10)
  @ValidateIf((object, value) => value !== null && value !== undefined)
  rating?: number | null;

  @ApiPropertyOptional({
    description: 'Updated detailed comments about the user\'s performance.',
    example: 'Showed significant improvement in a short time.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @ValidateIf((object, value) => value !== null && value !== undefined)
  comments?: string | null;
} 