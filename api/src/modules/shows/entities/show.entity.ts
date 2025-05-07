import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { User } from '../../users/entities/user.entity';
import { ShowAssignment } from '../../show-assignments/entities/show-assignment.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { EquipmentAssignment } from '../../equipment-assignments/entities/equipment-assignment.entity';
import { RevenueAllocation } from '../../revenue-allocations/entities/revenue-allocation.entity';
import { MemberEvaluation } from '../../member-evaluations/entities/member-evaluation.entity';
// Import related entities later
// import { MemberEvaluation } from '../../member-evaluations/entities/member-evaluation.entity';

// Enum for Show Status (Consider defining in a separate constants file)
export enum ShowStatus {
    PENDING = 'Pending',            // Mới tạo, chờ xử lý
    CONFIRMED = 'Confirmed',        // Đã xác nhận lịch với khách
    ASSIGNED = 'Assigned',          // Đã phân công photographer
    SHOOTING_COMPLETED = 'Shooting Completed', // Đã hoàn thành buổi chụp
    BLEND = 'Blend',                  // Đang xử lý Blend
    RETOUCH = 'Retouch',              // Đang xử lý Retouch
    DELIVERED = 'Delivered',          // Đã giao khách
    COMPLETED = 'Completed',        // Hoàn thành (bao gồm thanh toán)
    CANCELLED = 'Cancelled',        // Đã hủy
}

// Enum for Payment Status (Could also be derived)
export enum ShowPaymentStatus {
    UNPAID = 'Unpaid',
    PARTIALLY_PAID = 'Partially Paid', // Hoặc 'Còn nợ' như trong spec
    PAID = 'Paid',                // Hoặc 'Đã thanh toán đủ'
}

@Entity('shows')
export class Show {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client, (client) => client.shows, { nullable: false })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column('uuid', { name: 'client_id' })
  clientId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({ type: 'varchar', length: 100, nullable: false })
  show_type: string; // E.g., Wedding, Event, Product

  @Column({ type: 'timestamptz', nullable: false })
  start_datetime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  end_datetime: Date | null;

  @Column({ type: 'text', nullable: true })
  location_address: string | null;

  @Column({ type: 'text', nullable: true })
  location_details: string | null;

  @Column({ type: 'text', nullable: true })
  requirements: string | null; // Photographer notes from Manager

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    default: ShowStatus.PENDING,
    enum: ShowStatus,
  })
  status: ShowStatus;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: false,
    default: 0.00,
  })
  total_price: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    default: 0.00,
  })
  deposit_amount: number | null;

  @Column({ type: 'date', nullable: true })
  deposit_date: Date | null; // Changed to Date | null

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: false,
    default: 0.00,
  })
  total_collected: number;

  // amount_due is derived: total_price - total_collected
  // Consider making this a getter or calculated field if not storing directly
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: false,
    default: 0.00,
  })
  amount_due: number;

  // payment_status is derived from amounts
  // Consider making this a getter or calculated field
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    default: ShowPaymentStatus.UNPAID,
    enum: ShowPaymentStatus,
  })
  payment_status: ShowPaymentStatus;

  @Column({ type: 'date', nullable: true })
  post_processing_deadline: Date | null; // Changed to Date | null

  @Column({ type: 'timestamptz', nullable: true })
  delivered_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  completed_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  cancelled_at: Date | null;

  @Column({ type: 'text', nullable: true })
  cancellation_reason: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy: User | null;

  @Column('uuid', { name: 'created_by_user_id', nullable: true })
  @Index()
  created_by_user_id?: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // --- Relations --- //

  @OneToMany(() => ShowAssignment, (assignment) => assignment.show)
  assignments: ShowAssignment[];

  @OneToMany(() => Payment, (payment) => payment.show)
  payments: Payment[];

  @OneToMany(() => EquipmentAssignment, (assignment) => assignment.show)
  equipmentAssignments: EquipmentAssignment[];

  @OneToMany(() => RevenueAllocation, (allocation) => allocation.show)
  revenue_allocations: RevenueAllocation[];

  @OneToMany(() => MemberEvaluation, (evaluation) => evaluation.show)
  member_evaluations: MemberEvaluation[];

  // @OneToMany(() => MemberEvaluation, (evaluation) => evaluation.show) // Uncomment later
  // memberEvaluations: MemberEvaluation[];
}
