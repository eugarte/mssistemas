import { ICatalogRepository } from '@domain/repositories/ICatalogRepository';
import { ICatalogValueRepository } from '@domain/repositories/ICatalogValueRepository';
import { CatalogValue } from '@domain/entities/CatalogValue';

export interface ValidateCatalogValueDTO {
  catalogKey: string;
  code: string;
}

export class ValidateCatalogValueUseCase {
  constructor(
    private readonly catalogRepository: ICatalogRepository,
    private readonly catalogValueRepository: ICatalogValueRepository
  ) {}

  async execute(dto: ValidateCatalogValueDTO): Promise<{ valid: boolean; value?: CatalogValue }> {
    const catalog = await this.catalogRepository.findByKey(dto.catalogKey);
    if (!catalog) {
      return { valid: false };
    }

    const value = await this.catalogValueRepository.findByCode(catalog.id, dto.code);
    if (!value || !value.isActive || value.isDeleted()) {
      return { valid: false };
    }

    return { valid: true, value };
  }
}

export class GetPublicCatalogValuesUseCase {
  constructor(
    private readonly catalogRepository: ICatalogRepository,
    private readonly catalogValueRepository: ICatalogValueRepository
  ) {}

  async execute(catalogKey: string): Promise<CatalogValue[]> {
    const catalog = await this.catalogRepository.findByKey(catalogKey);
    if (!catalog || !catalog.isActive) {
      return [];
    }

    const values = await this.catalogValueRepository.findAllByCatalogId(catalog.id);
    return values.filter(v => v.isActive && !v.isDeleted());
  }
}
