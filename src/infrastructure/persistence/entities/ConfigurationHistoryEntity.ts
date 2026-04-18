import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('configuration_history')
export class ConfigurationHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'configuration_id' })
  configuration_id!: string;

  @Column({ type: 'enum', enum: ['created', 'updated', 'deleted'] })
  action!: string;

  @Column({ type: 'text', nullable: true, name: 'old_value' })
  old_value?: string;

  @Column({ type: 'text', nullable: true, name: 'new_value' })
  new_value?: string;

  @Column({ type: 'varchar', length: 100, name: 'changed_by', nullable: true })
  changed_by?: string;

  @Column({ type: 'text', name: 'change_reason', nullable: true })
  change_reason?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}
