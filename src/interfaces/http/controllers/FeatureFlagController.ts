import { Request, Response } from 'express';
import { 
  CreateFeatureFlagUseCase, 
  GetFeatureFlagsUseCase, 
  UpdateFeatureFlagUseCase,
  ToggleFeatureFlagUseCase,
  DeleteFeatureFlagUseCase,
  EvaluateFeatureFlagUseCase,
  AddFeatureFlagServiceOverrideUseCase,
  RemoveFeatureFlagServiceOverrideUseCase
} from '@application/use-cases/feature-flags/FeatureFlagUseCases';
import { FeatureFlagRepository } from '@infrastructure/persistence/repositories/FeatureFlagRepository';
import { 
  CreateFeatureFlagDto, 
  UpdateFeatureFlagDto, 
  EvaluateFeatureFlagDto,
  FeatureFlagServiceOverrideDto 
} from '@application/dtos/FeatureFlagDto';

export class FeatureFlagController {
  private createUseCase: CreateFeatureFlagUseCase;
  private getUseCase: GetFeatureFlagsUseCase;
  private updateUseCase: UpdateFeatureFlagUseCase;
  private toggleUseCase: ToggleFeatureFlagUseCase;
  private deleteUseCase: DeleteFeatureFlagUseCase;
  private evaluateUseCase: EvaluateFeatureFlagUseCase;
  private addOverrideUseCase: AddFeatureFlagServiceOverrideUseCase;
  private removeOverrideUseCase: RemoveFeatureFlagServiceOverrideUseCase;

  constructor() {
    const repository = new FeatureFlagRepository();
    this.createUseCase = new CreateFeatureFlagUseCase(repository);
    this.getUseCase = new GetFeatureFlagsUseCase(repository);
    this.updateUseCase = new UpdateFeatureFlagUseCase(repository);
    this.toggleUseCase = new ToggleFeatureFlagUseCase(repository);
    this.deleteUseCase = new DeleteFeatureFlagUseCase(repository);
    this.evaluateUseCase = new EvaluateFeatureFlagUseCase(repository);
    this.addOverrideUseCase = new AddFeatureFlagServiceOverrideUseCase(repository);
    this.removeOverrideUseCase = new RemoveFeatureFlagServiceOverrideUseCase(repository);
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: CreateFeatureFlagDto = req.body;
      const userId = (req as any).user?.userId;
      const result = await this.createUseCase.execute(dto, userId);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const { enabled } = req.query;
      
      let results;
      if (enabled === 'true') {
        results = await this.getUseCase.executeEnabled();
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
        res.status(404).json({ error: 'Feature flag not found' });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  findByKey = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.params;
      const result = await this.getUseCase.executeByKey(key);
      if (!result) {
        res.status(404).json({ error: 'Feature flag not found' });
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
      const dto: UpdateFeatureFlagDto = req.body;
      const result = await this.updateUseCase.execute(id, dto);
      if (!result) {
        res.status(404).json({ error: 'Feature flag not found' });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  toggle = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.toggleUseCase.execute(id);
      if (!result) {
        res.status(404).json({ error: 'Feature flag not found' });
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
        res.status(404).json({ error: 'Feature flag not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  evaluate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.params;
      const dto: EvaluateFeatureFlagDto = req.body;
      const result = await this.evaluateUseCase.execute(key, dto);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  addServiceOverride = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const dto: FeatureFlagServiceOverrideDto = req.body;
      const result = await this.addOverrideUseCase.execute(id, dto);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  removeServiceOverride = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, serviceId } = req.params;
      const success = await this.removeOverrideUseCase.execute(id, serviceId);
      if (!success) {
        res.status(404).json({ error: 'Service override not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
