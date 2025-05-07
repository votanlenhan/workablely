import { SetMetadata } from '@nestjs/common';
import { RoleName } from '@/modules/roles/entities/role-name.enum'; // Sửa đường dẫn import để trỏ đến file enum

export const ROLES_KEY = 'roles';
/**
 * Decorator to specify which roles are required to access a specific resource.
 * 
 * @param roles - An array of required RoleName enums.
 */
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles); 