import { CatalogValue } from '@domain/entities/CatalogValue';
import { ICatalogValueRepository } from '@domain/repositories/ICatalogValueRepository';
import { ICatalogRepository } from '@domain/repositories/ICatalogRepository';

export interface CreateCatalogValueDTO {
  catalogId: string;
  code: string;
  label: string;
  description?: string;
  color?: string;
  sortOrder?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export class CreateCatalogValueUseCase {
  constructor(
    private readonly catalogValueRepository: ICatalogValueRepository,
    private readonly catalogRepository: ICatalogRepository
  ) {}

  async execute(dto: CreateCatalogValueDTO): Promise<CatalogValue> {
    // Verify catalog exists
    const catalog = await this.catalogRepository.findById(dto.catalogId);
    if (!catalog) {
      throw new Error(`Catalog with id '${dto.catalogId}' not found`);
    }

    // Check if code already exists in this catalog
    const existing = await this.catalogValueRepository.findByCode(dto.catalogId, dto.code);
    if (existing) {
      throw new Error(`Value with code '${dto.code}' already exists in this catalog`);
    }

    const catalogValue = new CatalogValue(
      dto.catalogId,
      dto.code,
      dto.label,
      dto.description || null,
      dto.color || null,
      dto.sortOrder || 0,
      dto.isDefault || false,
      dto.isActive !== undefined ? dto.isActive : true
    );

    return this.catalogValueRepository.create(catalogValue);
  }
}
