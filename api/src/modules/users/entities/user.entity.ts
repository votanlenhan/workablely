import { Entity, Column, Index, BeforeInsert, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import * as bcrypt from 'bcrypt';
import { Role } from '../../roles/entities/role.entity';
import { Show } from '../../shows/entities/show.entity';
import { ShowAssignment } from '../../show-assignments/entities/show-assignment.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { EquipmentAssignment } from '../../equipment-assignments/entities/equipment-assignment.entity';
import { Expense } from '../../expenses/entities/expense.entity';
import { ExternalIncome } from '../../external-incomes/entities/external-income.entity';
import { RevenueAllocation } from '../../revenue-allocations/entities/revenue-allocation.entity';

/**
 * Represents a user in the system.
 */
@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password_hash: string;

  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone_number?: string;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  avatar_url?: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  last_login_at?: Date;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToMany(() => Show, (show) => show.createdBy)
  created_shows: Show[];

  @OneToMany(() => ShowAssignment, (assignment) => assignment.user)
  show_assignments: ShowAssignment[];

  @OneToMany(() => ShowAssignment, (assignment) => assignment.assigned_by_user)
  assigned_show_assignments: ShowAssignment[];

  @OneToMany(() => EquipmentAssignment, (eqAssignment) => eqAssignment.assigned_to_user)
  equipment_assignments: EquipmentAssignment[];

  @OneToMany(() => EquipmentAssignment, (eqAssignment) => eqAssignment.assigned_by_user)
  assigned_equipment_assignments: EquipmentAssignment[];

  @OneToMany(() => Payment, (payment) => payment.recorded_by_user)
  recorded_payments: Payment[];

  @OneToMany(() => Expense, (expense) => expense.recorded_by_user)
  recorded_expenses: Expense[];

  @OneToMany(() => ExternalIncome, (income) => income.recorded_by_user)
  recorded_external_incomes: ExternalIncome[];

  @OneToMany(() => RevenueAllocation, (allocation) => allocation.user)
  revenue_allocations: RevenueAllocation[];

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    if (this.password_hash && !this.password_hash.startsWith('$2b$')) {
      const saltRounds = 10;
      this.password_hash = await bcrypt.hash(this.password_hash, saltRounds);
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password_hash) return false;
    return bcrypt.compare(password, this.password_hash);
  }

  get full_name(): string {
    return `${this.first_name} ${this.last_name}`.trim();
  }

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }

  toPlainObject(): PlainUser {
    const plain = { ...this } as any;
    delete plain.password_hash;
    
    plain.roles = this.roles ? this.roles.map(role => 
      (role as any).toPlainObject ? (role as any).toPlainObject() : { id: role.id, name: role.name }
    ) : [];
        
    const keysToDelete = [
      'created_shows', 'show_assignments', 'assigned_show_assignments',
      'equipment_assignments', 'assigned_equipment_assignments', 'recorded_payments',
      'recorded_expenses', 'recorded_external_incomes', 'revenue_allocations',
      'hashPasswordBeforeInsert', 'hashPassword', 'validatePassword', 'full_name',
      'emailToLowerCase', 'toPlainObject', 'hasId', 'save', 'remove',
      'softRemove', 'recover', 'reload'
    ];
    for (const key of keysToDelete) {
      delete plain[key];
    }
    return plain as PlainUser;
  }
}

export type PlainUser = Omit<User, 
  'password_hash' | 'hashPasswordBeforeInsert' | 'hashPassword' | 'validatePassword' | 
  'full_name' | 'emailToLowerCase' | 'toPlainObject' | 'hasId' | 'save' | 'remove' | 
  'softRemove' | 'recover' | 'reload' |
  'created_shows' | 'show_assignments' | 'assigned_show_assignments' | 
  'equipment_assignments' | 'assigned_equipment_assignments' | 'recorded_payments' |
  'recorded_expenses' | 'recorded_external_incomes' | 'revenue_allocations'
> & { roles: Pick<Role, 'id' | 'name'>[] };
