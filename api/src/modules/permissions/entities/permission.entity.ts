import { Entity, Column, Index, Unique, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { Role } from '../../roles/entities/role.entity';

/**
 * Represents a permission defining an action on a subject.
 * Follows CASL conventions (action, subject).
 */
@Entity({ name: 'permissions' })
@Unique(['action', 'subject']) // Unique constraint on the combination
export class Permission extends BaseEntity {
  @Column({ type: 'varchar', nullable: false })
  @Index() // Index for faster lookups by action
  action: string; // e.g., 'create', 'read', 'update', 'delete', 'manage'

  @Column({ type: 'varchar', nullable: false })
  @Index() // Index for faster lookups by subject
  subject: string; // e.g., 'User', 'Show', 'Role', 'all'

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  // Relationship with Roles (Many-to-Many)
  // This is the inverse side of the relationship defined in Role.
  @ManyToMany(() => Role, (role) => role.permissions)
  // No @JoinTable here, as it's defined on the Role entity.
  roles: Role[];
}
