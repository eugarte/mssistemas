import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { ServiceEntity } from '../entities/ServiceEntity';
import { Service } from '@domain/entities/Service';
import { IServiceRepository } from '@domain/repositories/IServiceRepository';

export class ServiceRepository implements IServiceRepository {
  private repository: Repository<ServiceEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(ServiceEntity);
  }

  async findAll(): Promise<Service[]> {
    const entities = await this.repository.find({ order: { name: 'ASC' } });
    return entities.map(e => this.toDomain(e));
  }

  async findById(id: string): Promise<Service | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<Service | null> {
    const entity = await this.repository.findOne({ where: { name } });
    return entity ? this.toDomain(entity) : null;
  }

  async create(service: Service): Promise<Service> {
    const entity = this.toEntity(service);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(service: Service): Promise<Service> {
    const entity = this.toEntity(service);
    entity.id = service.id;
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(entity: ServiceEntity): Service {
    return new Service(
      entity.name,
      entity.displayName,
      entity.description,
      entity.version,
      entity.statusCatalogId,
      entity.statusValue,
      entity.teamOwner,
      entity.repositoryUrl,
      entity.documentationUrl,
      entity.technologyStack ? entity.technologyStack.split(',') : [],
      entity.healthCheckUrl,
      entity.id,
      entity.created_at,
      entity.updated_at
    );
  }

  private toEntity(domain: Service): ServiceEntity {
    const entity = new ServiceEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.displayName = domain.displayName;
    entity.description = domain.description;
    entity.version = domain.version;
    entity.statusCatalogId = domain.statusCatalogId;
    entity.statusValue = domain.statusValue;
    entity.teamOwner = domain.teamOwner;
    entity.repositoryUrl = domain.repositoryUrl;
    entity.documentationUrl = domain.documentationUrl;
    entity.technologyStack = domain.technologyStack.join(',');
    entity.healthCheckUrl = domain.healthCheckUrl;
    entity.created_at = domain.createdAt;
    entity.updated_at = domain.updatedAt;
    return entity;
  }
}
