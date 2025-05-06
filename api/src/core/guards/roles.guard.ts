import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from '@/modules/roles/entities/role.entity'; // Assuming Role entity location
import { User } from '@/modules/users/entities/user.entity'; // Assuming User entity location

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      // No specific roles required, allow access (or depend on JwtAuthGuard only)
      return true; 
    }

    const { user } = context.switchToHttp().getRequest<{ user?: User }>();

    if (!user || !user.roles) {
        // Should not happen if JwtAuthGuard runs first and populates user correctly
        console.error('[RolesGuard] User or user roles not found on request. Ensure JwtAuthGuard runs first.');
        throw new ForbiddenException('Access Denied: User information missing.');
    }

    const hasRequiredRole = requiredRoles.some((roleName) =>
        user.roles.some((userRole: Role) => userRole.name === roleName)
    );

    if (!hasRequiredRole) {
        throw new ForbiddenException(`Access Denied: Requires one of roles [${requiredRoles.join(', ')}]`);
    }

    return true;
  }
} 