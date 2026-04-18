import { IServiceRepository } from '@domain/repositories/IServiceRepository';
import { IServiceHeartbeatRepository } from '@domain/repositories/IServiceHeartbeatRepository';
import { Service } from '@domain/entities/Service';
import { ServiceHeartbeat, HeartbeatStatus } from '@domain/entities/ServiceHeartbeat';
import { CreateServiceDto, UpdateServiceDto, ServiceHeartbeatDto, ServiceResponseDto } from '@application/dtos/ServiceDto';

export class CreateServiceUseCase {
  constructor(
    private serviceRepository: IServiceRepository,
    private heartbeatRepository: IServiceHeartbeatRepository
  ) {}

  async execute(dto: CreateServiceDto): Promise<ServiceResponseDto> {
    const service = new Service({
      name: dto.name,
      displayName: dto.displayName || dto.name,
      description: dto.description,
      version: dto.version || '1.0.0',
      statusCatalogId: dto.statusCatalogId,
      statusValue: dto.statusValue,
      teamOwner: dto.teamOwner,
      repositoryUrl: dto.repositoryUrl,
      documentationUrl: dto.documentationUrl,
      technologyStack: dto.technologyStack || [],
      healthCheckUrl: dto.healthCheckUrl,
      healthCheckPath: dto.healthCheckPath,
      endpoints: dto.endpoints || {},
    });

    const saved = await this.serviceRepository.save(service);
    return this.toResponseDto(saved);
  }

  private toResponseDto(service: Service): ServiceResponseDto {
    return {
      id: service.id,
      name: service.name,
      displayName: service.displayName,
      description: service.description,
      version: service.version,
      statusCatalogId: service.statusCatalogId,
      statusValue: service.statusValue,
      teamOwner: service.teamOwner,
      repositoryUrl: service.repositoryUrl,
      documentationUrl: service.documentationUrl,
      technologyStack: service.technologyStack,
      healthCheckUrl: service.healthCheckUrl,
      healthCheckPath: service.healthCheckPath,
      endpoints: service.endpoints,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}

export class GetServicesUseCase {
  constructor(
    private serviceRepository: IServiceRepository,
    private heartbeatRepository: IServiceHeartbeatRepository
  ) {}

  async execute(): Promise<ServiceResponseDto[]> {
    const services = await this.serviceRepository.findActive();
    return Promise.all(services.map(s => this.toResponseDtoWithHeartbeat(s)));
  }

  async executeById(id: string): Promise<ServiceResponseDto | null> {
    const service = await this.serviceRepository.findById(id);
    return service ? this.toResponseDtoWithHeartbeat(service) : null;
  }

  async executeByName(name: string): Promise<ServiceResponseDto | null> {
    const service = await this.serviceRepository.findByName(name);
    return service ? this.toResponseDtoWithHeartbeat(service) : null;
  }

  private async toResponseDtoWithHeartbeat(service: Service): Promise<ServiceResponseDto> {
    const lastHeartbeat = await this.heartbeatRepository.findLatestByService(service.id);
    
    return {
      id: service.id,
      name: service.name,
      displayName: service.displayName,
      description: service.description,
      version: service.version,
      statusCatalogId: service.statusCatalogId,
      statusValue: service.statusValue,
      teamOwner: service.teamOwner,
      repositoryUrl: service.repositoryUrl,
      documentationUrl: service.documentationUrl,
      technologyStack: service.technologyStack,
      healthCheckUrl: service.healthCheckUrl,
      healthCheckPath: service.healthCheckPath,
      endpoints: service.endpoints,
      isActive: service.isActive,
      lastHeartbeat: lastHeartbeat ? {
        status: lastHeartbeat.status,
        reportedAt: lastHeartbeat.reportedAt,
      } : undefined,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}

export class UpdateServiceUseCase {
  constructor(private repository: IServiceRepository) {}

  async execute(id: string, dto: UpdateServiceDto): Promise<ServiceResponseDto | null> {
    const updated = await this.repository.update(id, {
      displayName: dto.displayName,
      description: dto.description,
      version: dto.version,
      statusCatalogId: dto.statusCatalogId,
      statusValue: dto.statusValue,
      teamOwner: dto.teamOwner,
      repositoryUrl: dto.repositoryUrl,
      documentationUrl: dto.documentationUrl,
      technologyStack: dto.technologyStack,
      healthCheckUrl: dto.healthCheckUrl,
      healthCheckPath: dto.healthCheckPath,
      endpoints: dto.endpoints,
      isActive: dto.isActive,
    });

    return updated ? this.toResponseDto(updated) : null;
  }

  private toResponseDto(service: Service): ServiceResponseDto {
    return {
      id: service.id,
      name: service.name,
      displayName: service.displayName,
      description: service.description,
      version: service.version,
      statusCatalogId: service.statusCatalogId,
      statusValue: service.statusValue,
      teamOwner: service.teamOwner,
      repositoryUrl: service.repositoryUrl,
      documentationUrl: service.documentationUrl,
      technologyStack: service.technologyStack,
      healthCheckUrl: service.healthCheckUrl,
      healthCheckPath: service.healthCheckPath,
      endpoints: service.endpoints,
      isActive: service.isActive,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}

export class DeleteServiceUseCase {
  constructor(private repository: IServiceRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.repository.softDelete(id);
  }
}

export class SendHeartbeatUseCase {
  constructor(private heartbeatRepository: IServiceHeartbeatRepository) {}

  async execute(serviceId: string, dto: ServiceHeartbeatDto): Promise<ServiceHeartbeat> {
    const heartbeat = new ServiceHeartbeat({
      serviceId,
      environment: dto.environment,
      instanceId: dto.instanceId || 'default',
      status: dto.status as HeartbeatStatus,
      responseTimeMs: dto.responseTimeMs,
      version: dto.version,
      metadata: dto.metadata,
    });

    return this.heartbeatRepository.save(heartbeat);
  }
}

export class GetServiceHealthUseCase {
  constructor(private heartbeatRepository: IServiceHeartbeatRepository) {}

  async execute(serviceId: string, environment?: string): Promise<ServiceHeartbeat | null> {
    return this.heartbeatRepository.findLatestByService(serviceId, environment);
  }
}
