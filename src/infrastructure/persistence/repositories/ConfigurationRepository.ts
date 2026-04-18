import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { ConfigurationEntity } from '../entities/ConfigurationEntity';
import { Configuration, ConfigurationType } from '@domain/entities/Configuration';
import { IConfigurationRepository, ConfigurationHistory } from '@domain/repositories/IConfigurationRepository';

export class ConfigurationRepository implements IConfigurationRepository {
  private repository: Repository<ConfigurationEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(ConfigurationEntity);
  }

  async findAll(filters?: { serviceId?: string | null; environment?: string | null; key?: string }): Promise<Configuration[]> {
    const query: any = { deleted_at: null };
    
    if (filters?.serviceId !== undefined) {
      query.service_id = filters.serviceId;
    }
    if (filters?.environment !== undefined) {
      query.environment = filters.environment;
    }
    if (filters?.key !== undefined) {
      query.key = filters.key;
    }

    const entities = await this.repository.find({
      where: query,
      order: { key: 'ASC' }
    });
    return entities.map(e => this.toDomain(e));
  }

  async findById(id: string): Promise<Configuration | null> {
    const entity = await this.repository.findOne({ where: { id, deleted_at: null } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByKey(key: string, serviceId?: string | null, environment?: string | null): Promise<Configuration | null> {
    const where: any = { key, service_id: serviceId ?? null, environment: environment ?? null, deleted_at: null };
    const entity = await this.repository.findOne({ where });
    return entity ? this.toDomain(entity) : null;
  }

  async findByHierarchy(key: string, serviceId?: string, environment?: string): Promise<Configuration | null> {
    // Priority: service+environment > service > environment > default
    const configs = await this.repository.find({
      where: { key, deleted_at: null }
    });

    // service + environment
    let config = configs.find(c => c.service_id === serviceId && c.environment === environment);
    if (config) return this.toDomain(config);

    // service only
    config = configs.find(c => c.service_id === serviceId && c.environment === null);
    if (config) return this.toDomain(config);

    // environment only
    config = configs.find(c => c.service_id === null && c.environment === environment);
    if (config) return this.toDomain(config);

    // default
    config = configs.find(c => c.service_id === null && c.environment === null);
    if (config) return this.toDomain(config);

    return null;
  }

  async create(configuration: Configuration): Promise<Configuration> {
    const entity = this.toEntity(configuration);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(configuration: Configuration): Promise<Configuration> {
    const entity = this.toEntity(configuration);
    entity.id = configuration.id;
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async findHistory(configurationId: string): Promise<ConfigurationHistory[]> {
    // In a real implementation, this would query a history table
    // For now, return empty array as placeholder
    return [];
  }

  private toDomain(entity: ConfigurationEntity): Configuration {
    return new Configuration(
      entity.key,
      entity.value,
      entity.type as ConfigurationType,
      entity.service_id,
      entity.environment,
      entity.is_secret,
      entity.is_encrypted,
      entity.description,
      entity.tags ? entity.tags.split(',') : [],
      entity.created_by,
      entity.id,
      entity.created_at,
      entity.updated_at,
      entity.deleted_at
    );
  }

  private toEntity(domain: Configuration): ConfigurationEntity {
    const entity = new ConfigurationEntity();
    entity.id = domain.id;
    entity.service_id = domain.serviceId;
    entity.environment = domain.environment;
    entity.key = domain.key;
    entity.value = domain.value;
    entity.type = domain.type;
    entity.is_secret = domain.isSecret;
    entity.is_encrypted = domain.isEncrypted;
    entity.version = domain.version;
    entity.description = domain.description;
    entity.tags = domain.tags.join(',');
    entity.created_by = domain.createdBy;
    entity.created_at = domain.createdAt;
    entity.updated_at = domain.updatedAt;
    entity.deleted_at = domain.deletedAt;
    return entity;
  }
}
