import { Request, Response } from 'express';
import { 
  GetDashboardStatusUseCase,
  HealthCheckUseCase,
  CleanupOldHeartbeatsUseCase
} from '@application/use-cases/health/HealthUseCases';
import { ServiceRepository } from '@infrastructure/persistence/repositories/ServiceRepository';
import { ServiceHeartbeatRepository } from '@infrastructure/persistence/repositories/ServiceHeartbeatRepository';

export class HealthController {
  private dashboardUseCase: GetDashboardStatusUseCase;
  private healthCheckUseCase: HealthCheckUseCase;
  private cleanupUseCase: CleanupOldHeartbeatsUseCase;

  constructor() {
    const serviceRepository = new ServiceRepository();
    const heartbeatRepository = new ServiceHeartbeatRepository();
    
    this.dashboardUseCase = new GetDashboardStatusUseCase(serviceRepository, heartbeatRepository);
    this.healthCheckUseCase = new HealthCheckUseCase();
    this.cleanupUseCase = new CleanupOldHeartbeatsUseCase(heartbeatRepository);
  }

  health = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.healthCheckUseCase.execute();
      const statusCode = result.status === 'healthy' ? 200 : result.status === 'degraded' ? 200 : 503;
      res.status(statusCode).json(result);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date(),
        error: (error as Error).message,
      });
    }
  };

  dashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.dashboardUseCase.execute();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  cleanup = async (req: Request, res: Response): Promise<void> => {
    try {
      const { olderThanMinutes } = req.query;
      const minutes = olderThanMinutes ? parseInt(olderThanMinutes as string) : 60;
      const deleted = await this.cleanupUseCase.execute(minutes);
      res.json({ deleted });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
