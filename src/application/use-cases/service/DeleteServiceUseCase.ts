import { IServiceRepository } from '@domain/repositories/IServiceRepository';

export class DeleteServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(id: string): Promise<void> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new Error(`Service with id '${id}' not found`);
    }

    return this.serviceRepository.delete(id);
  }
}
