import { ICatalogRepository } from '@domain/repositories/ICatalogRepository';
import { Catalog } from '@domain/entities/Catalog';

export class GetAllCatalogsUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(): Promise<Catalog[]> {
    return this.catalogRepository.findAll();
  }
}

export class GetCatalogByIdUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(id: string): Promise<Catalog | null> {
    return this.catalogRepository.findById(id);
  }
}

export class GetCatalogByKeyUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(key: string): Promise<Catalog | null> {
    return this.catalogRepository.findByKey(key);
  }
}
