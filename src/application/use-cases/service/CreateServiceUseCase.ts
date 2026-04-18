import { Service } from '@domain/entities/Service';
import { IServiceRepository } from '@domain/repositories/IServiceRepository';

export interface CreateServiceDTO {
  name: string;
  displayName: string;
  description?: string;
  version?: string;
  statusCatalogId?: string;
  statusValue?: string;
  teamOwner?: string;
  repositoryUrl?: string;
  documentationUrl?: string;
  technologyStack?: string[];
  healthCheckUrl?: string;
}

export class CreateServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(dto: CreateServiceDTO): Promise<Service> {
    // Check if name already exists
    const existing = await this.serviceRepository.findByName(dto.name);
    if (existing) {
      throw new Error(`Service with name '${dto.name}' already exists`);
    }

    const service = new Service(
      dto.name,
      dto.displayName,
      dto.description || null,
      dto.version || '1.0.0',
      dto.statusCatalogId || null,
      dto.statusValue || null,
      dto.teamOwner || null,
      dto.repositoryUrl || null,
      dto.documentationUrl || null,
      dto.technologyStack || [],
      dto.healthCheckUrl || null
    );

    return this.serviceRepository.create(service);
  }
}
