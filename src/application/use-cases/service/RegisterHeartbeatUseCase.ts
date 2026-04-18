import { ServiceHeartbeat, ServiceStatus } from '@domain/entities/ServiceHeartbeat';
import { IServiceHeartbeatRepository } from '@domain/repositories/IServiceHeartbeatRepository';
import { IServiceRepository } from '@domain/repositories/IServiceRepository';

export interface RegisterHeartbeatDTO {
  serviceId: string;
  environment: string;
  instanceId?: string;
  status?: ServiceStatus;
  responseTimeMs?: number;
  version?: string;
  metadata?: Record<string, any>;
}

export class RegisterHeartbeatUseCase {
  constructor(
    private readonly serviceHeartbeatRepository: IServiceHeartbeatRepository,
    private readonly serviceRepository: IServiceRepository
  ) {}

  async execute(dto: RegisterHeartbeatDTO): Promise<ServiceHeartbeat> {
    // Verify service exists
    const service = await this.serviceRepository.findById(dto.serviceId);
    if (!service) {
      throw new Error(`Service with id '${dto.serviceId}' not found`);
    }

    const heartbeat = new ServiceHeartbeat(
      dto.serviceId,
      dto.environment,
      dto.instanceId || 'default',
      dto.status || 'up',
      dto.responseTimeMs || 0,
      dto.version || service.version,
      dto.metadata || {}
    );

    return this.serviceHeartbeatRepository.create(heartbeat);
  }
}
