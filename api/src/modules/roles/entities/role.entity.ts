import { Entity, Column, Index, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Permission } from '../../permissions/entities/permission.entity';

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @Column({ unique: true, nullable: false })
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  is_system_role: boolean;

  // Define M2M relationship with User (owning side defined in User)
  @ManyToMany(() => User, (user) => user.roles)
  // We don't define @JoinTable here, it's defined on the User entity typically
  users: User[];

  // Define M2M relationship with Permission (owning side)
  @ManyToMany(() => Permission, (permission) => permission.roles, { cascade: true })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
} 