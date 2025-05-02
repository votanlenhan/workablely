import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRolesDto {
  @ApiProperty({
    description: 'Array of Role UUIDs to assign or remove from the user.',
    type: [String],
    format: 'uuid',
    example: [
      'd290f1ee-6c54-4b01-90e6-d701748f0851',
      'd290f1ee-6c54-4b01-90e6-d701748f0852',
    ],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsUUID('all', { each: true, message: 'Each roleId must be a valid UUID' })
  readonly roleIds: string[];
}
