import { Request, Response } from 'express';
import { 
  CreateServiceUseCase, 
  GetServicesUseCase, 
  UpdateServiceUseCase,
  DeleteServiceUseCase,
  SendHeartbeatUseCase,
  GetServiceHealthUseCase
} from '@application/use-cases/services/ServiceUseCases';
import { ServiceRepository } from '@infrastructure/persistence/repositories/ServiceRepository';
import { ServiceHeartbeatRepository } from '@infrastructure/persistence/repositories/ServiceHeartbeatRepository';
import { CreateServiceDto, UpdateServiceDto, ServiceHeartbeatDto } from '@application/dtos/ServiceDto';

export class ServiceController {
  private createUseCase: CreateServiceUseCase;
  private getUseCase: GetServicesUseCase;
  private updateUseCase: UpdateServiceUseCase;
  private deleteUseCase: DeleteServiceUseCase;
  private heartbeatUseCase: SendHeartbeatUseCase;
  private healthUseCase: GetServiceHealthUseCase;

  constructor() {
    const repository = new ServiceRepository();
    const heartbeatRepository = new ServiceHeartbeatRepository();
    this.createUseCase = new CreateServiceUseCase(repository, heartbeatRepository);
    this.getUseCase = new GetServicesUseCase(repository, heartbeatRepository);
    this.updateUseCase = new UpdateServiceUseCase(repository);
    this.deleteUseCase = new DeleteServiceUseCase(repository);
    this.heartbeatUseCase = new SendHeartbeatUseCase(heartbeatRepository);
    this.healthUseCase = new GetServiceHealthUseCase(heartbeatRepository);
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: CreateServiceDto = req.body;
      const result = await this.createUseCase.execute(dto);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const results = await this.getUseCase.execute();
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.getUseCase.executeById(id);
      if (!result) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  findByName = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name } = req.params;
      const result = await this.getUseCase.executeByName(name);
      if (!result) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const dto: UpdateServiceDto = req.body;
      const result = await this.updateUseCase.execute(id, dto);
      if (!result) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.deleteUseCase.execute(id);
      if (!success) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  heartbeat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const dto: ServiceHeartbeatDto = req.body;
      const result = await this.heartbeatUseCase.execute(id, dto);
      res.status(201).json({
        id: result.id,
        serviceId: result.serviceId,
        status: result.status,
        reportedAt: result.reportedAt,
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { environment } = req.query;
      const result = await this.healthUseCase.execute(id, environment as string);
      if (!result) {
        res.status(404).json({ error: 'No health data found' });
        return;
      }
      res.json({
        status: result.status,
        responseTimeMs: result.responseTimeMs,
        version: result.version,
        reportedAt: result.reportedAt,
        isStale: result.isStale(),
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
