import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { CatalogValueEntity } from '../entities/CatalogValueEntity';
import { CatalogValue } from '@domain/entities/CatalogValue';
import { ICatalogValueRepository } from '@domain/repositories/ICatalogValueRepository';

export class CatalogValueRepository implements ICatalogValueRepository {
  private repository: Repository<CatalogValueEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(CatalogValueEntity);
  }

  async findAllByCatalogId(catalogId: string): Promise<CatalogValue[]> {
    const entities = await this.repository.find({
      where: { catalog_id: catalogId },
      order: { sort_order: 'ASC' }
    });
    return entities.map(e => this.toDomain(e));
  }

  async findById(id: string): Promise<CatalogValue | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCode(catalogId: string, code: string): Promise<CatalogValue | null> {
    const entity = await this.repository.findOne({
      where: { catalog_id: catalogId, code }
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findDefaultByCatalogId(catalogId: string): Promise<CatalogValue | null> {
    const entity = await this.repository.findOne({
      where: { catalog_id: catalogId, is_default: true, is_active: true }
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(catalogValue: CatalogValue): Promise<CatalogValue> {
    const entity = this.toEntity(catalogValue);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(catalogValue: CatalogValue): Promise<CatalogValue> {
    const entity = this.toEntity(catalogValue);
    entity.id = catalogValue.id;
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  private toDomain(entity: CatalogValueEntity): CatalogValue {
    return new CatalogValue(
      entity.catalog_id,
      entity.code,
      entity.label,
      entity.description,
      entity.color,
      entity.sort_order,
      entity.is_default,
      entity.is_active,
      entity.id,
      entity.created_at,
      entity.updated_at,
      entity.deleted_at
    );
  }

  private toEntity(domain: CatalogValue): CatalogValueEntity {
    const entity = new CatalogValueEntity();
    entity.id = domain.id;
    entity.catalog_id = domain.catalogId;
    entity.code = domain.code;
    entity.label = domain.label;
    entity.description = domain.description;
    entity.color = domain.color;
    entity.sort_order = domain.sortOrder;
    entity.is_default = domain.isDefault;
    entity.is_active = domain.isActive;
    entity.created_at = domain.createdAt;
    entity.updated_at = domain.updatedAt;
    entity.deleted_at = domain.deletedAt;
    return entity;
  }
}
