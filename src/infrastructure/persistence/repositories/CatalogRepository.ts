import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { CatalogEntity } from '../entities/CatalogEntity';
import { Catalog } from '@domain/entities/Catalog';
import { ICatalogRepository } from '@domain/repositories/ICatalogRepository';

export class CatalogRepository implements ICatalogRepository {
  private repository: Repository<CatalogEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(CatalogEntity);
  }

  async findAll(): Promise<Catalog[]> {
    const entities = await this.repository.find({
      relations: ['values'],
      order: { key: 'ASC' }
    });
    return entities.map(e => this.toDomain(e));
  }

  async findById(id: string): Promise<Catalog | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['values']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByKey(key: string): Promise<Catalog | null> {
    const entity = await this.repository.findOne({
      where: { key },
      relations: ['values']
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(catalog: Catalog): Promise<Catalog> {
    const entity = this.toEntity(catalog);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async update(catalog: Catalog): Promise<Catalog> {
    const entity = this.toEntity(catalog);
    entity.id = catalog.id;
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(entity: CatalogEntity): Catalog {
    return new Catalog(
      entity.key,
      entity.name,
      entity.description,
      entity.allow_multiple,
      entity.is_active,
      entity.created_by,
      entity.id,
      entity.created_at,
      entity.updated_at
    );
  }

  private toEntity(domain: Catalog): CatalogEntity {
    const entity = new CatalogEntity();
    entity.id = domain.id;
    entity.key = domain.key;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.allow_multiple = domain.allowMultiple;
    entity.is_active = domain.isActive;
    entity.created_by = domain.createdBy;
    entity.created_at = domain.createdAt;
    entity.updated_at = domain.updatedAt;
    return entity;
  }
}
