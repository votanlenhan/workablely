import { SetMetadata } from '@nestjs/common';
import { RoleName } from '@/modules/roles/entities/role.entity'; // Use alias path for RoleName enum

export const ROLES_KEY = 'roles';
/**
 * Decorator to specify which roles are required to access a specific resource.
 * 
 * @param roles - An array of required RoleName enums.
 */
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles); 