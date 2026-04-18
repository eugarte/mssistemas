import { IServiceRepository } from '@domain/repositories/IServiceRepository';
import { Service } from '@domain/entities/Service';

export interface UpdateServiceDTO {
  displayName?: string;
  description?: string | null;
  version?: string;
  statusCatalogId?: string | null;
  statusValue?: string | null;
  teamOwner?: string | null;
  repositoryUrl?: string | null;
  documentationUrl?: string | null;
  technologyStack?: string[];
  healthCheckUrl?: string | null;
}

export class UpdateServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(id: string, dto: UpdateServiceDTO): Promise<Service> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new Error(`Service with id '${id}' not found`);
    }

    service.update(dto);
    return this.serviceRepository.update(service);
  }
}
