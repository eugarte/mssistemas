import { IServiceRepository } from '@domain/repositories/IServiceRepository';
import { IServiceHeartbeatRepository } from '@domain/repositories/IServiceHeartbeatRepository';
import { DashboardStatusResponseDto, ServiceStatusDto, HealthCheckResponseDto } from '@application/dtos/CommonDto';
import { AppDataSource } from '@infrastructure/persistence/config/data-source';
import { CacheService } from '@infrastructure/cache/CacheService';

export class GetDashboardStatusUseCase {
  constructor(
    private serviceRepository: IServiceRepository,
    private heartbeatRepository: IServiceHeartbeatRepository
  ) {}

  async execute(): Promise<DashboardStatusResponseDto> {
    const services = await this.serviceRepository.findActive();
    const serviceStatuses: ServiceStatusDto[] = [];
    
    let healthyCount = 0;
    let degradedCount = 0;
    let downCount = 0;
    let unknownCount = 0;

    for (const service of services) {
      const lastHeartbeat = await this.heartbeatRepository.findLatestByService(service.id);
      
      let status = 'unknown';
      let lastHeartbeatDate: Date | undefined;

      if (lastHeartbeat) {
        lastHeartbeatDate = lastHeartbeat.reportedAt;
        
        if (lastHeartbeat.isStale(2)) {
          status = 'unknown';
          unknownCount++;
        } else {
          status = lastHeartbeat.status;
          if (status === 'up') healthyCount++;
          else if (status === 'degraded') degradedCount++;
          else downCount++;
        }
      } else {
        unknownCount++;
      }

      serviceStatuses.push({
        id: service.id,
        name: service.name,
        displayName: service.displayName,
        status,
        version: service.version,
        lastHeartbeat: lastHeartbeatDate,
        environment: lastHeartbeat?.environment,
      });
    }

    return {
      totalServices: services.length,
      healthyServices: healthyCount,
      degradedServices: degradedCount,
      downServices: downCount,
      unknownServices: unknownCount,
      services: serviceStatuses,
    };
  }
}

export class HealthCheckUseCase {
  private cacheService: CacheService;

  constructor() {
    this.cacheService = new CacheService();
  }

  async execute(): Promise<HealthCheckResponseDto> {
    const checks: { database?: string; cache?: string } = {};
    
    // Check database
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.query('SELECT 1');
        checks.database = 'healthy';
      } else {
        checks.database = 'unhealthy - not initialized';
      }
    } catch (error) {
      checks.database = 'unhealthy';
    }

    // Check cache
    try {
      await this.cacheService.set('health-check', 'ok', 5);
      const cacheResult = await this.cacheService.get('health-check');
      checks.cache = cacheResult === 'ok' ? 'healthy' : 'unhealthy';
    } catch (error) {
      checks.cache = 'unhealthy';
    }

    const isHealthy = checks.database === 'healthy' && checks.cache === 'healthy';
    const isDegraded = (checks.database === 'healthy' || checks.cache === 'healthy') && !isHealthy;

    return {
      status: isHealthy ? 'healthy' : isDegraded ? 'degraded' : 'unhealthy',
      timestamp: new Date(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks,
    };
  }
}

export class CleanupOldHeartbeatsUseCase {
  constructor(private heartbeatRepository: IServiceHeartbeatRepository) {}

  async execute(olderThanMinutes: number = 60): Promise<number> {
    return this.heartbeatRepository.deleteOld(olderThanMinutes);
  }
}
