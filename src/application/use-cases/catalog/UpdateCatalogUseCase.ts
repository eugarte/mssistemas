import { ICatalogRepository } from '@domain/repositories/ICatalogRepository';
import { Catalog } from '@domain/entities/Catalog';

export interface UpdateCatalogDTO {
  name?: string;
  description?: string | null;
  allowMultiple?: boolean;
  isActive?: boolean;
}

export class UpdateCatalogUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(id: string, dto: UpdateCatalogDTO): Promise<Catalog> {
    const catalog = await this.catalogRepository.findById(id);
    if (!catalog) {
      throw new Error(`Catalog with id '${id}' not found`);
    }

    catalog.update(dto);
    return this.catalogRepository.update(catalog);
  }
}
