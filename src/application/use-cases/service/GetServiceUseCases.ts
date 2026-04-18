import { IServiceRepository } from '@domain/repositories/IServiceRepository';
import { Service } from '@domain/entities/Service';

export class GetAllServicesUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(): Promise<Service[]> {
    return this.serviceRepository.findAll();
  }
}

export class GetServiceByIdUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(id: string): Promise<Service | null> {
    return this.serviceRepository.findById(id);
  }
}

export class GetServiceByNameUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(name: string): Promise<Service | null> {
    return this.serviceRepository.findByName(name);
  }
}
