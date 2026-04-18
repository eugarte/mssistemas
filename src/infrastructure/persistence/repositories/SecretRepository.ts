import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { SecretEntity } from '../entities/SecretEntity';
import { Secret } from '@domain/entities/Secret';
import { ISecretRepository, SecretAccessLog } from '@domain/repositories/ISecretRepository';

export class SecretRepository implements ISecretRepository {
  private repository: Repository<SecretEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(SecretEntity);
  }

  async findAll(filters?: { serviceId?: string | null; environment?: string | null }): Promise<Secret[]> {
    const where: any = {};
    if (filters?.serviceId !== undefined) {
      where.service_id = filters.serviceId;
    }
    if (filters?.environment !== undefined) {
      where.environment = filters.environment;
    }

    const entities = Object.keys(where).length > 0
      ? await this.repository.find({ where, order: { key: 'ASC' } })
      : await this.repository.find({ order: { key: 'ASC' } });
    return entities.map(e => this.toDomain(e));
  }

  async findById(id: string): Promise<Secret | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByKey(key: string, serviceId?: string | null, environment?: string | null): Promise<Secret | null> {
    const where: any = { key, service_id: serviceId ?? null, environment: environment ?? null };
    const entity = await this.repository.findOne({ where });
    return entity ? this.toDomain(entity) : null;
  }

  async create(secret: Secret): Promise<Secret> {
    const entity = this.toEntity(secret);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(secret: Secret): Promise<Secret> {
    const entity = this.toEntity(secret);
    entity.id = secret.id;
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findAccessLogs(secretId: string): Promise<SecretAccessLog[]> {
    // In a real implementation, this would query a secret_access_logs table
    return [];
  }

  private toDomain(entity: SecretEntity): Secret {
    return new Secret(
      entity.key,
      entity.encryptedValue,
      entity.encryptionVersion,
      entity.service_id,
      entity.environment,
      entity.expires_at,
      entity.created_by,
      entity.id,
      entity.created_at,
      entity.updated_at,
      entity.lastRotatedAt,
      entity.isRotating
    );
  }

  private toEntity(domain: Secret): SecretEntity {
    const entity = new SecretEntity();
    entity.id = domain.id;
    entity.service_id = domain.serviceId;
    entity.environment = domain.environment;
    entity.key = domain.key;
    entity.encryptedValue = domain.encryptedValue;
    entity.encryptionVersion = domain.encryptionVersion;
    entity.isRotating = domain.isRotating;
    entity.lastRotatedAt = domain.lastRotatedAt;
    entity.expires_at = domain.expiresAt;
    entity.created_by = domain.createdBy;
    entity.created_at = domain.createdAt;
    entity.updated_at = domain.updatedAt;
    return entity;
  }
}
