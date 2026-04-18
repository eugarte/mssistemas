import { CatalogValue } from '@domain/entities/CatalogValue';

export interface ICatalogValueRepository {
  findAllByCatalogId(catalogId: string): Promise<CatalogValue[]>;
  findById(id: string): Promise<CatalogValue | null>;
  findByCode(catalogId: string, code: string): Promise<CatalogValue | null>;
  findDefaultByCatalogId(catalogId: string): Promise<CatalogValue | null>;
  create(catalogValue: CatalogValue): Promise<CatalogValue>;
  update(catalogValue: CatalogValue): Promise<CatalogValue>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
}
