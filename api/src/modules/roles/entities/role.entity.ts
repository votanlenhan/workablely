import { Entity, Column, Index, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Permission } from '../../permissions/entities/permission.entity';

// Define standard role names as an enum
export enum RoleName {
    ADMIN = 'Admin',
    MANAGER = 'Manager',
    ART_LEAD = 'Art Lead',
    // Add other predefined system/management roles here
    PHOTOGRAPHER = 'Photographer', // Example standard user role
    DESIGNER = 'Designer', // Example standard user role
}

/**
 * Represents a user role within the system, defining a set of permissions.
 */
@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @Column({ type: 'varchar', unique: true, nullable: false })
  @Index() // Index for faster lookups by name
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'boolean', default: false, nullable: false })
  is_system_role: boolean; // Indicates if the role is predefined and cannot be deleted/modified heavily

  // Relationship with Users (Many-to-Many)
  // The actual join table 'user_roles' is defined in the migration
  // but TypeORM needs this definition for relation mapping.
  @ManyToMany(() => User, (user) => user.roles)
  // We don't define @JoinTable here, it's usually defined on the owning side.
  // Assuming User entity will define the @JoinTable for user_roles.
  // Let's double check User entity later if needed.
  users: User[];

  // Relationship with Permissions (Many-to-Many)
  @ManyToMany(() => Permission, (permission) => permission.roles, {
    cascade: ['insert', 'update'], // Cascade operations for permissions when managing roles
  })
  @JoinTable({
    name: 'role_permissions', // Explicitly naming the join table
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}
