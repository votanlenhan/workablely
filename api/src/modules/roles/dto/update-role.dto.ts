import { PartialType } from '@nestjs/swagger'; // Or '@nestjs/mapped-types' if swagger is not used heavily for this
import { CreateRoleDto } from './create-role.dto';

// All properties of CreateRoleDto become optional
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
