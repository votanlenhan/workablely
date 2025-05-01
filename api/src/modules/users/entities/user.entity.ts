import { Entity, Column, Index, BeforeInsert } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import * as bcrypt from 'bcrypt';
// import { Role } from '../../roles/entities/role.entity'; // Keep commented out for now
// import { JoinTable, ManyToMany } from 'typeorm'; // Keep commented out for now
import { v4 as uuidv4 } from 'uuid';

// TODO: Define roles relation later when Role entity exists
// import { Role } from '../../roles/entities/role.entity';
// import { JoinTable, ManyToMany } from 'typeorm';

/**
 * Represents a user in the system.
 */
@Entity({ name: 'users' }) // Explicitly set table name
export class User extends BaseEntity {
  @Column({ type: 'varchar', unique: true, nullable: false })
  @Index() // Add index for faster lookups
  email: string;

  @Column({ type: 'varchar', nullable: false, select: false }) // Exclude password from default selects
  password_hash: string;

  @Column({ type: 'varchar', nullable: false })
  first_name: string;

  @Column({ type: 'varchar', nullable: false })
  last_name: string;

  // Consider making this a virtual column or generated in DB if supported easily,
  // otherwise, can be generated in service/getter.
  // @Column({ generated: 'CONCAT(first_name, \' \', last_name)', asExpression: 'CONCAT(first_name, \' \', last_name)' })
  // full_name: string;

  @Column({ type: 'varchar', nullable: true })
  phone_number?: string | null; // Made optional and nullable consistent with schema

  @Column({ type: 'varchar', nullable: true })
  avatar_url?: string | null; // Made optional and nullable consistent with schema

  @Column({ type: 'boolean', default: true, nullable: false })
  is_active: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_login_at?: Date | null; // Made optional and nullable consistent with schema

  // TODO: Add Roles relationship (M2M) later
  // @ManyToMany(() => Role, (role) => role.users, { cascade: ['insert', 'update'] })
  // @JoinTable({
  //   name: 'user_roles',
  //   joinColumn: { name: 'user_id', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  // })
  // roles: Role[]; // Restore comment for the property, keep decorators commented

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    // Hash password only if it's provided and not already hashed
    // This handles cases where we might create users with pre-hashed passwords
    if (this.password_hash && !this.password_hash.startsWith('$2b$')) { // Basic check if likely hashed
      const saltRounds = 10; // Consider moving to config
      this.password_hash = await bcrypt.hash(this.password_hash, saltRounds);
    }
  }

  // Method to manually hash a password (e.g., when updating)
  async hashPassword(password: string): Promise<string> {
     const saltRounds = 10; // Consider moving to config
     return bcrypt.hash(password, saltRounds);
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

  // Constructor removed as TypeORM handles object creation
} 