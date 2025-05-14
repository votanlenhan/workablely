import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from '@/modules/users/entities/user.entity';
import { RequiredPermission, PERMISSIONS_KEY } from '../decorators/required-permissions.decorator';
// import { RoleName } from '@/modules/roles/entities/role-name.enum'; // RoleName not used if fix is removed

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user: User | undefined = request.user;

    // --- DEBUG LOG ---
    // console.log('[PermissionsGuard] Received user object:', JSON.stringify(user, null, 2));
    // --- END DEBUG LOG ---

    // --- START TEMPORARY FIX for E2E Setup ---
    // If the user has the Admin role, grant access immediately.
    // This bypasses specific permission checks for Admins.
    // TODO: Remove this and rely on proper seeding ensuring Admin role has manage:all
    /* // Temporarily commenting out this block
    if (user?.roles?.some(role => role.name === RoleName.ADMIN)) {
      console.warn('[PermissionsGuard] TEMP FIX: Allowing access for Admin role directly.');
      return true;
    }
    */
    // --- END TEMPORARY FIX ---

    if (!requiredPermission) {
      console.warn('[PermissionsGuard] No required permission defined for this route.');
      // No specific permission required, allow access
      return true;
    }

    if (!user || !user.roles) {
      throw new ForbiddenException('Access Denied: User information missing.');
    }

    // Check if user has the required permission or a wildcard permission
    const hasPermission = user.roles.some((role) => {
      // Check for the 'manage:all' super permission first
      if (role.permissions.some(p => p.action === 'manage' && p.subject === 'all')) {
        return true;
      }
      // Check for specific required permission or relevant wildcards
      return role.permissions.some((permission) => {
        // Check for action match (exact or wildcard)
        const actionMatch =
          permission.action === 'manage' || // 'manage' implies all actions
          permission.action === '*' ||
          requiredPermission.action === '*' ||
          permission.action?.toLowerCase() === requiredPermission.action?.toLowerCase();

        // Check for subject match (exact or wildcard)
        const subjectMatch =
          permission.subject === 'all' || // 'all' implies all subjects
          permission.subject === '*' ||
          requiredPermission.subject === '*' ||
          permission.subject?.toLowerCase() === requiredPermission.subject?.toLowerCase();

        return actionMatch && subjectMatch;
      });
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access Denied: Requires permission "${requiredPermission.action}" on "${requiredPermission.subject}"`,
      );
    }

    return true;
  }
} 