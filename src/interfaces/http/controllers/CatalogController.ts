import { Request, Response } from 'express';
import { GetCatalogsUseCase, GetCatalogByIdUseCase, CreateCatalogUseCase, UpdateCatalogUseCase, DeleteCatalogUseCase, GetCatalogValuesUseCase, AddCatalogValueUseCase, UpdateCatalogValueUseCase, RemoveCatalogValueUseCase } from '@application/use-cases/catalogs';
import { CatalogRepository } from '@infrastructure/persistence/repositories/CatalogRepository';
import { CreateCatalogDto, UpdateCatalogDto, CreateCatalogValueDto, UpdateCatalogValueDto } from '@application/dtos';

export class CatalogController {
  private getCatalogsUseCase: GetCatalogsUseCase;
  private getCatalogByIdUseCase: GetCatalogByIdUseCase;
  private createCatalogUseCase: CreateCatalogUseCase;
  private updateCatalogUseCase: UpdateCatalogUseCase;
  private deleteCatalogUseCase: DeleteCatalogUseCase;
  private getCatalogValuesUseCase: GetCatalogValuesUseCase;
  private addCatalogValueUseCase: AddCatalogValueUseCase;
  private updateCatalogValueUseCase: UpdateCatalogValueUseCase;
  private removeCatalogValueUseCase: RemoveCatalogValueUseCase;

  constructor() {
    const repository = new CatalogRepository();
    this.getCatalogsUseCase = new GetCatalogsUseCase(repository);
    this.getCatalogByIdUseCase = new GetCatalogByIdUseCase(repository);
    this.createCatalogUseCase = new CreateCatalogUseCase(repository);
    this.updateCatalogUseCase = new UpdateCatalogUseCase(repository);
    this.deleteCatalogUseCase = new DeleteCatalogUseCase(repository);
    this.getCatalogValuesUseCase = new GetCatalogValuesUseCase(repository);
    this.addCatalogValueUseCase = new AddCatalogValueUseCase(repository);
    this.updateCatalogValueUseCase = new UpdateCatalogValueUseCase(repository);
    this.removeCatalogValueUseCase = new RemoveCatalogValueUseCase(repository);
  }

  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const { isActive, search } = req.query;
      const result = await this.getCatalogsUseCase.execute({
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        search: search as string | undefined,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  findById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.getCatalogByIdUseCase.execute(id);
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
      const result = await this.getCatalogByIdUseCase.executeByKey(key);
      if (!result) {
        res.status(404).json({ error: 'Catalog not found' });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: CreateCatalogDto = req.body;
      const userId = (req as any).user?.userId;
      const result = await this.createCatalogUseCase.execute(dto, userId);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const dto: UpdateCatalogDto = req.body;
      const userId = (req as any).user?.userId;
      const result = await this.updateCatalogUseCase.execute(id, dto, userId);
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
      const userId = (req as any).user?.userId;
      const success = await this.deleteCatalogUseCase.execute(id, userId);
      if (!success) {
        res.status(404).json({ error: 'Catalog not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  // Catalog Values
  getValues = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { isActive } = req.query;
      const result = await this.getCatalogValuesUseCase.execute(id, {
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  addValue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const dto: CreateCatalogValueDto = req.body;
      const userId = (req as any).user?.userId;
      const result = await this.addCatalogValueUseCase.execute(id, dto, userId);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  updateValue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { valueId } = req.params;
      const dto: UpdateCatalogValueDto = req.body;
      const userId = (req as any).user?.userId;
      const result = await this.updateCatalogValueUseCase.execute(valueId, dto, userId);
      if (!result) {
        res.status(404).json({ error: 'Catalog value not found' });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  removeValue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { valueId } = req.params;
      const userId = (req as any).user?.userId;
      const success = await this.removeCatalogValueUseCase.execute(valueId, userId);
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