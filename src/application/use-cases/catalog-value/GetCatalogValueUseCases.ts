import { ICatalogValueRepository } from '@domain/repositories/ICatalogValueRepository';
import { CatalogValue } from '@domain/entities/CatalogValue';

export class GetCatalogValuesByCatalogIdUseCase {
  constructor(private readonly catalogValueRepository: ICatalogValueRepository) {}

  async execute(catalogId: string): Promise<CatalogValue[]> {
    return this.catalogValueRepository.findAllByCatalogId(catalogId);
  }
}

export class GetCatalogValueByIdUseCase {
  constructor(private readonly catalogValueRepository: ICatalogValueRepository) {}

  async execute(id: string): Promise<CatalogValue | null> {
    return this.catalogValueRepository.findById(id);
  }
}

export class GetCatalogValueByCodeUseCase {
  constructor(private readonly catalogValueRepository: ICatalogValueRepository) {}

  async execute(catalogId: string, code: string): Promise<CatalogValue | null> {
    return this.catalogValueRepository.findByCode(catalogId, code);
  }
}

export class GetDefaultCatalogValueUseCase {
  constructor(private readonly catalogValueRepository: ICatalogValueRepository) {}

  async execute(catalogId: string): Promise<CatalogValue | null> {
    return this.catalogValueRepository.findDefaultByCatalogId(catalogId);
  }
}
