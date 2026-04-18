import { Request, Response } from 'express';
import { 
  CreateCatalogUseCase, 
  GetCatalogsUseCase, 
  UpdateCatalogUseCase,
  DeleteCatalogUseCase,
  CreateCatalogValueUseCase,
  GetCatalogValuesUseCase,
  UpdateCatalogValueUseCase,
  DeleteCatalogValueUseCase,
  ValidateCatalogValueUseCase 
} from '@application/use-cases/catalogs/CatalogUseCases';
import { CatalogRepository } from '@infrastructure/persistence/repositories/CatalogRepository';
import { CreateCatalogDto, UpdateCatalogDto, CreateCatalogValueDto, UpdateCatalogValueDto } from '@application/dtos/CatalogDto';

export class CatalogController {
  private createUseCase: CreateCatalogUseCase;
  private getUseCase: GetCatalogsUseCase;
  private updateUseCase: UpdateCatalogUseCase;
  private deleteUseCase: DeleteCatalogUseCase;
  private createValueUseCase: CreateCatalogValueUseCase;
  private getValuesUseCase: GetCatalogValuesUseCase;
  private updateValueUseCase: UpdateCatalogValueUseCase;
  private deleteValueUseCase: DeleteCatalogValueUseCase;
  private validateValueUseCase: ValidateCatalogValueUseCase;

  constructor() {
    const repository = new CatalogRepository();
    this.createUseCase = new CreateCatalogUseCase(repository);
    this.getUseCase = new GetCatalogsUseCase(repository);
    this.updateUseCase = new UpdateCatalogUseCase(repository);
    this.deleteUseCase = new DeleteCatalogUseCase(repository);
    this.createValueUseCase = new CreateCatalogValueUseCase(repository);
    this.getValuesUseCase = new GetCatalogValuesUseCase(repository);
    this.updateValueUseCase = new UpdateCatalogValueUseCase(repository);
    this.deleteValueUseCase = new DeleteCatalogValueUseCase(repository);
    this.validateValueUseCase = new ValidateCatalogValueUseCase(repository);
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: CreateCatalogDto = req.body;
      const userId = (req as any).user?.userId;
      const result = await this.createUseCase.execute(dto, userId);
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
      const result = await this.getUseCase.executeByKey(id);
      if (!result) {
        res.status(404).json({ error: 'Catalog not found' });
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
        res.status(404).json({ error: 'Catalog not found' });
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
      const dto: UpdateCatalogDto = req.body;
      const result = await this.updateUseCase.execute(id, dto);
      if (!result) {
        res.status(404).json({ error: 'Catalog not found' });
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
        res.status(404).json({ error: 'Catalog not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  // Values
  createValue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const dto: CreateCatalogValueDto = req.body;
      const result = await this.createValueUseCase.execute(id, dto);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  findValues = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const results = await this.getValuesUseCase.execute(id);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  findValuesByKey = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.params;
      const results = await this.getValuesUseCase.executeByKey(key);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  validateValue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { key } = req.params;
      const { code } = req.body;
      const isValid = await this.validateValueUseCase.execute(key, code);
      res.json({ valid: isValid });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  updateValue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { valueId } = req.params;
      const dto: UpdateCatalogValueDto = req.body;
      const result = await this.updateValueUseCase.execute(valueId, dto);
      if (!result) {
        res.status(404).json({ error: 'Catalog value not found' });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  deleteValue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { valueId } = req.params;
      const success = await this.deleteValueUseCase.execute(valueId);
      if (!success) {
        res.status(404).json({ error: 'Catalog value not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
