import { PartialType } from '@nestjs/mapped-types';
import { CreateShowRoleDto } from './create-show-role.dto';

export class UpdateShowRoleDto extends PartialType(CreateShowRoleDto) {} 