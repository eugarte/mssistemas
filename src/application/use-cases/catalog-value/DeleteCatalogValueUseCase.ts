import { ICatalogValueRepository } from '@domain/repositories/ICatalogValueRepository';

export class DeleteCatalogValueUseCase {
  constructor(private readonly catalogValueRepository: ICatalogValueRepository) {}

  async execute(id: string, permanent: boolean = false): Promise<void> {
    const catalogValue = await this.catalogValueRepository.findById(id);
    if (!catalogValue) {
      throw new Error(`Catalog value with id '${id}' not found`);
    }

    if (permanent) {
      return this.catalogValueRepository.delete(id);
    } else {
      return this.catalogValueRepository.softDelete(id);
    }
  }
}
