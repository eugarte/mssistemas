import { Repository, LessThan } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { AuditLogEntity } from '../entities';
import { IAuditLogRepository } from '@domain/repositories/IAuditLogRepository';
import { AuditLog, AuditEntityType, AuditActorType } from '@domain/entities/AuditLog';

export class AuditLogRepository implements IAuditLogRepository {
  private repository: Repository<AuditLogEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(AuditLogEntity);
  }

  async findAll(limit: number = 100): Promise<AuditLog[]> {
    const entities = await this.repository.find({
      order: { created_at: 'DESC' },
      take: limit,
    });
    return entities.map(this.toDomain);
  }

  async findById(id: string): Promise<AuditLog | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    const entities = await this.repository.find({
      where: { entity_type: entityType, entity_id: entityId },
      order: { created_at: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async findByActor(actor: string): Promise<AuditLog[]> {
    const entities = await this.repository.find({
      where: { actor },
      order: { created_at: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    const entities = await this.repository.find({
      where: {
        created_at: LessThan(endDate),
      },
      order: { created_at: 'DESC' },
    });
    return entities.filter((e) => e.created_at >= startDate).map(this.toDomain);
  }

  async save(auditLog: AuditLog): Promise<AuditLog> {
    const entity = this.toEntity(auditLog);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async deleteOld(olderThanDays: number): Promise<number> {
    const threshold = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const result = await this.repository.delete({
      created_at: LessThan(threshold),
    });
    return result.affected || 0;
  }

  private toDomain(entity: AuditLogEntity): AuditLog {
    return new AuditLog({
      id: entity.id,
      entityType: entity.entity_type as AuditEntityType,
      entityId: entity.entity_id,
      action: entity.action,
      actor: entity.actor,
      actorType: entity.actor_type as AuditActorType,
      ipAddress: entity.ip_address,
      details: entity.details,
      createdAt: entity.created_at,
    });
  }

  private toEntity(domain: AuditLog): AuditLogEntity {
    const entity = new AuditLogEntity();
    entity.id = domain.id;
    entity.entity_type = domain.entityType;
    entity.entity_id = domain.entityId;
    entity.action = domain.action;
    entity.actor = domain.actor;
    entity.actor_type = domain.actorType;
    entity.ip_address = domain.ipAddress;
    entity.details = domain.details;
    return entity;
  }
}
