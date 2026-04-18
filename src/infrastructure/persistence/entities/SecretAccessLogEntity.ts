import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('secret_access_logs')
export class SecretAccessLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'secret_id' })
  secret_id!: string;

  @Column({ type: 'uuid', name: 'service_id', nullable: true })
  service_id?: string;

  @Column({ type: 'enum', enum: ['read', 'write', 'rotate'] })
  action!: string;

  @Column({ type: 'varchar', length: 100, name: 'accessed_by', nullable: true })
  accessed_by?: string;

  @Column({ type: 'varchar', length: 50, name: 'ip_address', nullable: true })
  ip_address?: string;

  @Column({ type: 'text', name: 'user_agent', nullable: true })
  user_agent?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
