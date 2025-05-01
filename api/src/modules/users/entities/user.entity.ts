import { Entity, Column, Index, BeforeInsert } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import * as bcrypt from 'bcrypt';
import { Role } from '../../roles/entities/role.entity';
import { JoinTable, ManyToMany } from 'typeorm';

// TODO: Define roles relation later when Role entity exists
// import { Role } from '../../roles/entities/role.entity';
// import { JoinTable, ManyToMany } from 'typeorm';

@Entity({ name: 'users' }) // Explicitly set table name
export class User extends BaseEntity {
  @Column({ unique: true, nullable: false })
  @Index() // Add index for faster lookups
  email: string;

  @Column({ nullable: false, select: false }) // Exclude password from default selects
  password_hash: string;

  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: false })
  last_name: string;

  // Consider making this a virtual column or generated in DB if supported easily,
  // otherwise, can be generated in service/getter.
  // @Column({ generated: 'CONCAT(first_name, \' \', last_name)', asExpression: 'CONCAT(first_name, \' \', last_name)' })
  // full_name: string;

  @Column({ nullable: true })
  phone_number?: string;

  @Column({ nullable: true })
  avatar_url?: string;

  @Column({ type: 'boolean', default: true, nullable: false })
  is_active: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_login_at?: Date;

  // Add Roles relationship (owning side)
  @ManyToMany(() => Role, (role) => role.users, { cascade: ['insert', 'update'] })
  @JoinTable({
    name: 'user_roles', // Explicit junction table name
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @BeforeInsert()
  async hashPassword() {
    if (this.password_hash) { // Check if password_hash is set (might be set directly if importing hashed passwords)
      const saltRounds = 10; // Or get from config
      this.password_hash = await bcrypt.hash(this.password_hash, saltRounds);
    }
  }

  // Helper method (not a DB column) to compare password
  async validatePassword(password: string): Promise<boolean> {
    if (!this.password_hash) return false;
    return bcrypt.compare(password, this.password_hash);
  }

  // Optional: Getter for full name
  get full_name(): string {
    return `${this.first_name} ${this.last_name}`.trim();
  }
} 