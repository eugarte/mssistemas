import { IServiceHeartbeatRepository } from '@domain/repositories/IServiceHeartbeatRepository';
import { IServiceRepository } from '@domain/repositories/IServiceRepository';

export interface ServiceHealthStatus {
  serviceId: string;
  serviceName: string;
  environment: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastHeartbeat: Date | null;
  version: string | null;
  responseTimeMs: number | null;
}

export class GetServiceHealthUseCase {
  constructor(
    private readonly serviceHeartbeatRepository: IServiceHeartbeatRepository,
    private readonly serviceRepository: IServiceRepository
  ) {}

  async execute(serviceId: string, environment?: string): Promise<ServiceHealthStatus[]> {
    const service = await this.serviceRepository.findById(serviceId);
    if (!service) {
      throw new Error(`Service with id '${serviceId}' not found`);
    }

    const heartbeats = await this.serviceHeartbeatRepository.findAll({
      serviceId,
      environment
    });

    return heartbeats.map(h => ({
      serviceId: service.id,
      serviceName: service.name,
      environment: h.environment,
      status: h.isStale() ? 'unhealthy' : h.status === 'up' ? 'healthy' : 'unhealthy',
      lastHeartbeat: h.reportedAt,
      version: h.version,
      responseTimeMs: h.responseTimeMs
    }));
  }
}

export class GetAllServicesHealthUseCase {
  constructor(
    private readonly serviceHeartbeatRepository: IServiceHeartbeatRepository,
    private readonly serviceRepository: IServiceRepository
  ) {}

  async execute(): Promise<ServiceHealthStatus[]> {
    const services = await this.serviceRepository.findAll();
    const allHeartbeats = await this.serviceHeartbeatRepository.findAll();

    // Group heartbeats by serviceId and get latest for each environment
    const latestByService: Map<string, Map<string, typeof allHeartbeats[0]>> = new Map();
    
    for (const heartbeat of allHeartbeats) {
      if (!latestByService.has(heartbeat.serviceId)) {
        latestByService.set(heartbeat.serviceId, new Map());
      }
      const envMap = latestByService.get(heartbeat.serviceId)!;
      const existing = envMap.get(heartbeat.environment);
      if (!existing || heartbeat.reportedAt > existing.reportedAt) {
        envMap.set(heartbeat.environment, heartbeat);
      }
    }

    const result: ServiceHealthStatus[] = [];
    
    for (const service of services) {
      const envMap = latestByService.get(service.id);
      if (envMap) {
        for (const [environment, heartbeat] of envMap) {
          result.push({
            serviceId: service.id,
            serviceName: service.name,
            environment,
            status: heartbeat.isStale() ? 'unhealthy' : heartbeat.status === 'up' ? 'healthy' : 'unhealthy',
            lastHeartbeat: heartbeat.reportedAt,
            version: heartbeat.version,
            responseTimeMs: heartbeat.responseTimeMs
          });
        }
      } else {
        // Service exists but has no heartbeats
        result.push({
          serviceId: service.id,
          serviceName: service.name,
          environment: 'unknown',
          status: 'unknown',
          lastHeartbeat: null,
          version: service.version,
          responseTimeMs: null
        });
      }
    }

    return result;
  }
}
