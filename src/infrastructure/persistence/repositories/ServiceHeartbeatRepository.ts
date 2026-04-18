import { Repository, LessThan } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { ServiceHeartbeatEntity } from '../entities/ServiceHeartbeatEntity';
import { ServiceHeartbeat, ServiceStatus } from '@domain/entities/ServiceHeartbeat';
import { IServiceHeartbeatRepository } from '@domain/repositories/IServiceHeartbeatRepository';

export class ServiceHeartbeatRepository implements IServiceHeartbeatRepository {
  private repository: Repository<ServiceHeartbeatEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(ServiceHeartbeatEntity);
  }

  async findAll(filters?: { serviceId?: string; environment?: string }): Promise<ServiceHeartbeat[]> {
    const where: any = {};
    if (filters?.serviceId) {
      where.serviceId = filters.serviceId;
    }
    if (filters?.environment) {
      where.environment = filters.environment;
    }

    const entities = Object.keys(where).length > 0
      ? await this.repository.find({ where, order: { reportedAt: 'DESC' } })
      : await this.repository.find({ order: { reportedAt: 'DESC' } });
    return entities.map(e => this.toDomain(e));
  }

  async findById(id: string): Promise<ServiceHeartbeat | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findLatestByService(serviceId: string, environment: string): Promise<ServiceHeartbeat | null> {
    const entity = await this.repository.findOne({
      where: { serviceId, environment },
      order: { reportedAt: 'DESC' }
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(heartbeat: ServiceHeartbeat): Promise<ServiceHeartbeat> {
    const entity = this.toEntity(heartbeat);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findStale(thresholdMinutes: number): Promise<ServiceHeartbeat[]> {
    const threshold = new Date(Date.now() - thresholdMinutes * 60 * 1000);
    const entities = await this.repository.find({
      where: { reportedAt: LessThan(threshold) },
      order: { reportedAt: 'DESC' }
    });
    return entities.map(e => this.toDomain(e));
  }

  private toDomain(entity: ServiceHeartbeatEntity): ServiceHeartbeat {
    return new ServiceHeartbeat(
      entity.serviceId,
      entity.environment,
      entity.instanceId,
      entity.status as ServiceStatus,
      entity.responseTimeMs,
      entity.version,
      entity.metadata,
      entity.reportedAt,
      entity.id,
      entity.created_at
    );
  }

  private toEntity(domain: ServiceHeartbeat): ServiceHeartbeatEntity {
    const entity = new ServiceHeartbeatEntity();
    entity.id = domain.id;
    entity.serviceId = domain.serviceId;
    entity.environment = domain.environment;
    entity.instanceId = domain.instanceId;
    entity.status = domain.status;
    entity.responseTimeMs = domain.responseTimeMs;
    entity.version = domain.version;
    entity.metadata = domain.metadata;
    entity.reportedAt = domain.reportedAt;
    entity.created_at = domain.createdAt;
    return entity;
  }
}
