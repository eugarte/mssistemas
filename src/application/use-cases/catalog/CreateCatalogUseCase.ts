import { Catalog } from '@domain/entities/Catalog';
import { ICatalogRepository } from '@domain/repositories/ICatalogRepository';

export interface CreateCatalogDTO {
  key: string;
  name: string;
  description?: string;
  allowMultiple?: boolean;
  isActive?: boolean;
}

export class CreateCatalogUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(dto: CreateCatalogDTO, createdBy: string = 'system'): Promise<Catalog> {
    // Check if key already exists
    const existing = await this.catalogRepository.findByKey(dto.key);
    if (existing) {
      throw new Error(`Catalog with key '${dto.key}' already exists`);
    }

    const catalog = new Catalog(
      dto.key,
      dto.name,
      dto.description || null,
      dto.allowMultiple || false,
      dto.isActive !== undefined ? dto.isActive : true,
      createdBy
    );

    return this.catalogRepository.create(catalog);
  }
}
