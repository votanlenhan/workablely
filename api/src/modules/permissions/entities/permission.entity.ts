import { Entity, Column, Index, ManyToMany, Unique } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity({ name: 'permissions' })
@Unique(['action', 'subject']) // Ensure unique combination
export class Permission extends BaseEntity {
  @Column({ nullable: false })
  action: string;

  @Column({ nullable: false })
  subject: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Define M2M relationship with Role (inverse side)
  @ManyToMany(() => Role, (role) => role.permissions)
  // @JoinTable is defined on the Role entity
  roles: Role[];
} 