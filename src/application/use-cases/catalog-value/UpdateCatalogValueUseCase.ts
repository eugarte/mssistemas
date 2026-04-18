import { ICatalogValueRepository } from '@domain/repositories/ICatalogValueRepository';
import { CatalogValue } from '@domain/entities/CatalogValue';

export interface UpdateCatalogValueDTO {
  code?: string;
  label?: string;
  description?: string | null;
  color?: string | null;
  sortOrder?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export class UpdateCatalogValueUseCase {
  constructor(private readonly catalogValueRepository: ICatalogValueRepository) {}

  async execute(id: string, dto: UpdateCatalogValueDTO): Promise<CatalogValue> {
    const catalogValue = await this.catalogValueRepository.findById(id);
    if (!catalogValue) {
      throw new Error(`Catalog value with id '${id}' not found`);
    }

    catalogValue.update(dto);
    return this.catalogValueRepository.update(catalogValue);
  }
}
