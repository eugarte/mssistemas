import { Catalog } from '@domain/entities/Catalog';

export interface ICatalogRepository {
  findAll(): Promise<Catalog[]>;
  findById(id: string): Promise<Catalog | null>;
  findByKey(key: string): Promise<Catalog | null>;
  create(catalog: Catalog): Promise<Catalog>;
  update(catalog: Catalog): Promise<Catalog>;
  delete(id: string): Promise<void>;
}
