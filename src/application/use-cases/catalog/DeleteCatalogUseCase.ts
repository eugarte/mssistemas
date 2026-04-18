import { ICatalogRepository } from '@domain/repositories/ICatalogRepository';

export class DeleteCatalogUseCase {
  constructor(private readonly catalogRepository: ICatalogRepository) {}

  async execute(id: string): Promise<void> {
    const catalog = await this.catalogRepository.findById(id);
    if (!catalog) {
      throw new Error(`Catalog with id '${id}' not found`);
    }

    return this.catalogRepository.delete(id);
  }
}
