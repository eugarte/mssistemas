import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { FeatureFlagEntity } from '../entities/FeatureFlagEntity';
import { FeatureFlag, FeatureFlagStrategy } from '@domain/entities/FeatureFlag';
import { IFeatureFlagRepository, FeatureFlagServiceAssignment } from '@domain/repositories/IFeatureFlagRepository';

export class FeatureFlagRepository implements IFeatureFlagRepository {
  private repository: Repository<FeatureFlagEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(FeatureFlagEntity);
  }

  async findAll(): Promise<FeatureFlag[]> {
    const entities = await this.repository.find({ order: { key: 'ASC' } });
    return entities.map(e => this.toDomain(e));
  }

  async findById(id: string): Promise<FeatureFlag | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByKey(key: string): Promise<FeatureFlag | null> {
    const entity = await this.repository.findOne({ where: { key } });
    return entity ? this.toDomain(entity) : null;
  }

  async create(featureFlag: FeatureFlag): Promise<FeatureFlag> {
    const entity = this.toEntity(featureFlag);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(featureFlag: FeatureFlag): Promise<FeatureFlag> {
    const entity = this.toEntity(featureFlag);
    entity.id = featureFlag.id;
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByServiceId(serviceId: string): Promise<FeatureFlag[]> {
    // In a real implementation, this would join with feature_flag_services table
    // For now, return empty array
    return [];
  }

  private toDomain(entity: FeatureFlagEntity): FeatureFlag {
    return new FeatureFlag(
      entity.key,
      entity.name,
      entity.description,
      entity.enabled,
      entity.strategy as FeatureFlagStrategy,
      entity.percentage,
      entity.target_users ? entity.target_users.split(',') : [],
      entity.target_groups ? entity.target_groups.split(',') : [],
      entity.schedule_start,
      entity.schedule_end,
      entity.created_by,
      entity.id,
      entity.created_at,
      entity.updated_at
    );
  }

  private toEntity(domain: FeatureFlag): FeatureFlagEntity {
    const entity = new FeatureFlagEntity();
    entity.id = domain.id;
    entity.key = domain.key;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.enabled = domain.enabled;
    entity.strategy = domain.strategy;
    entity.percentage = domain.percentage;
    entity.target_users = domain.targetUsers.join(',');
    entity.target_groups = domain.targetGroups.join(',');
    entity.schedule_start = domain.scheduleStart;
    entity.schedule_end = domain.scheduleEnd;
    entity.created_by = domain.createdBy;
    entity.created_at = domain.createdAt;
    entity.updated_at = domain.updatedAt;
    return entity;
  }
}
