import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConfigurationValueType } from '../entities/configuration-value-type.enum';

export class CreateConfigurationDto {
  @ApiProperty({ description: 'Unique key for the configuration', maxLength: 255, example: 'SITE_NAME' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  key: string;

  @ApiProperty({ description: 'Value of the configuration (stored as string)', example: 'My Awesome App' })
  @IsString() // All values are initially strings, service layer will handle based on value_type for storage/retrieval if needed
  @IsNotEmpty()
  value: string;

  @ApiPropertyOptional({ description: 'Description of what this configuration is for', example: 'The public display name of the website.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ConfigurationValueType, description: 'Type of the value', example: ConfigurationValueType.STRING, default: ConfigurationValueType.STRING })
  @IsEnum(ConfigurationValueType)
  @IsNotEmpty()
  value_type: ConfigurationValueType = ConfigurationValueType.STRING;

  @ApiPropertyOptional({ description: 'Whether this configuration can be edited via API after creation', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  is_editable?: boolean = true;
} 