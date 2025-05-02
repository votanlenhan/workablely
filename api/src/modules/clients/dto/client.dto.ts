import { PartialType } from '@nestjs/mapped-types';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber()
  @MaxLength(20)
  readonly phone_number: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  readonly email?: string;

  @IsOptional()
  @IsString()
  readonly address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly source?: string;

  @IsOptional()
  @IsString()
  readonly notes?: string;
}

export class UpdateClientDto extends PartialType(CreateClientDto) {}
