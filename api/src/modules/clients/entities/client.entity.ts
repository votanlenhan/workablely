import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../core/database/base.entity';
import { Show } from '../../shows/entities/show.entity'; // Uncomment import

@Entity({ name: 'clients' })
export class Client extends BaseEntity {
  @Column({ nullable: false })
  @Index() // Index for searching
  name: string;

  @Column({ nullable: false })
  @Index() // Index for searching
  phone_number: string;

  @Column({ unique: true, nullable: true })
  @Index()
  email?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ nullable: true })
  source?: string; // Could be an Enum later

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Define O2M relationship with Show (Uncommented)
  @OneToMany(() => Show, (show) => show.client)
  shows: Show[];
} 