import { Request, Response } from 'express';
import { 
  CreateConfigurationUseCase, 
  GetConfigurationsUseCase, 
  UpdateConfigurationUseCase,
  DeleteConfigurationUseCase,
  GetConfigurationHistoryUseCase
} from '@application/use-cases/configurations/ConfigurationUseCases';
import { ConfigurationRepository } from '@infrastructure/persistence/repositories/ConfigurationRepository';
import { CreateConfigurationDto, UpdateConfigurationDto } from '@application/dtos/ConfigurationDto';

export class ConfigurationController {
  private createUseCase: CreateConfigurationUseCase;
  private getUseCase: GetConfigurationsUseCase;
  private updateUseCase: UpdateConfigurationUseCase;
  private deleteUseCase: DeleteConfigurationUseCase;
  private historyUseCase: GetConfigurationHistoryUseCase;

  constructor() {
    const repository = new ConfigurationRepository();
    this.createUseCase = new CreateConfigurationUseCase(repository);
    this.getUseCase = new GetConfigurationsUseCase(repository);
    this.updateUseCase = new UpdateConfigurationUseCase(repository);
    this.deleteUseCase = new DeleteConfigurationUseCase(repository);
    this.historyUseCase = new GetConfigurationHistoryUseCase(repository);
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: CreateConfigurationDto = req.body;
      const userId = (req as any).user?.userId;
      const result = await this.createUseCase.execute(dto, userId);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const { serviceId, environment, search } = req.query;
      
      let results;
      if (search) {
        results = await this.getUseCase.search(search as string);
      } else if (serviceId && environment) {
        results = await this.getUseCase.executeByServiceAndEnvironment(
          serviceId as string, 
          environment as string
        );
      } else if (serviceId) {
        results = await this.getUseCase.executeByService(serviceId as string);
      } else if (environment) {
        results = await this.getUseCase.executeByEnvironment(environment as string);
      } else {
        results = await this.getUseCase.execute();
      }
      
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
        res.status(404).json({ error: 'Configuration not found' });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getMostSpecific = async (req: Request, res: Response): Promise<void> => {
    try {
      const { serviceId, environment, key } = req.query;
      if (!serviceId || !environment || !key) {
        res.status(400).json({ error: 'Missing required query parameters' });
        return;
      }
      
      const result = await this.getUseCase.executeMostSpecific(
        serviceId as string,
        environment as string,
        key as string
      );
      
      if (!result) {
        res.status(404).json({ error: 'Configuration not found' });
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
      const dto: UpdateConfigurationDto = req.body;
      const userId = (req as any).user?.userId;
      const result = await this.updateUseCase.execute(id, dto, userId);
      if (!result) {
        res.status(404).json({ error: 'Configuration not found' });
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
      const userId = (req as any).user?.userId;
      const success = await this.deleteUseCase.execute(id, userId);
      if (!success) {
        res.status(404).json({ error: 'Configuration not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const results = await this.historyUseCase.execute(id);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
