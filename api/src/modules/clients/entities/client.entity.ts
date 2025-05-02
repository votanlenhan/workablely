import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';
import { Show } from '../../shows/entities/show.entity'; // Adjust path as needed

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @Column({ length: 20 })
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber() // Removed null for region-agnostic validation
  @MaxLength(20)
  phone_number: string;

  @Column({ length: 255, unique: true, nullable: true })
  @Index({ unique: true, where: '"email" IS NOT NULL' }) // Ensure uniqueness for non-null emails
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Column({ length: 100, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  // --- Relations --- //

  @OneToMany(() => Show, (show) => show.client)
  shows: Show[];
}
