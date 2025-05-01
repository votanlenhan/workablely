import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { Client } from '../../clients/entities/client.entity';
import { User } from '../../users/entities/user.entity';
// Import related entities later
// import { ShowAssignment } from '../../show-assignments/entities/show-assignment.entity';
// import { EquipmentAssignment } from '../../equipment-assignments/entities/equipment-assignment.entity';
// import { Payment } from '../../payments/entities/payment.entity';
// import { RevenueAllocation } from '../../revenue-allocations/entities/revenue-allocation.entity';
// import { MemberEvaluation } from '../../member-evaluations/entities/member-evaluation.entity';

@Entity({ name: 'shows' })
export class Show extends BaseEntity {
  @Column({ type: 'uuid', nullable: false })
  client_id: string;

  @ManyToOne(() => Client, (client) => client.shows, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'client_id' })
  @Index()
  client: Client;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: false })
  show_type: string; // Consider Enum

  @Column({ type: 'timestamp with time zone', nullable: false })
  @Index()
  start_datetime: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  end_datetime?: Date;

  @Column({ type: 'text', nullable: true })
  location_address?: string;

  @Column({ type: 'text', nullable: true })
  location_details?: string;

  @Column({ type: 'text', nullable: true })
  requirements?: string;

  @Column({ nullable: false, default: 'Pending' })
  @Index()
  status: string; // Consider Enum

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: false,
    default: 0.0,
  })
  total_price: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    default: 0.0,
  })
  deposit_amount?: number;

  @Column({ type: 'date', nullable: true })
  deposit_date?: Date;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: false,
    default: 0.0,
  })
  total_collected: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: false,
    default: 0.0,
  })
  amount_due: number;

  @Column({ nullable: false, default: 'Unpaid' })
  @Index()
  payment_status: string; // Consider Enum

  @Column({ type: 'date', nullable: true })
  post_processing_deadline?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  delivered_at?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  cancelled_at?: Date;

  @Column({ type: 'text', nullable: true })
  cancellation_reason?: string;

  @Column({ type: 'uuid', nullable: true })
  created_by_user_id?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_user_id' })
  @Index()
  created_by?: User;

  // --- O2M Relations (Commented out until target entities exist) ---
  // @OneToMany(() => ShowAssignment, (assignment) => assignment.show)
  // assignments: ShowAssignment[];

  // @OneToMany(() => EquipmentAssignment, (assignment) => assignment.show)
  // equipmentAssignments: EquipmentAssignment[];

  // @OneToMany(() => Payment, (payment) => payment.show)
  // payments: Payment[];

  // @OneToMany(() => RevenueAllocation, (allocation) => allocation.show)
  // revenueAllocations: RevenueAllocation[];

  // @OneToMany(() => MemberEvaluation, (evaluation) => evaluation.show)
  // memberEvaluations: MemberEvaluation[];
} 