import { Request, Response } from 'express';
import { 
  CreateSecretUseCase, 
  GetSecretsUseCase, 
  GetSecretValueUseCase,
  UpdateSecretUseCase,
  RotateSecretUseCase,
  DeleteSecretUseCase,
  GetSecretAccessLogsUseCase
} from '@application/use-cases/secrets/SecretUseCases';
import { SecretRepository } from '@infrastructure/persistence/repositories/SecretRepository';
import { AuditLogRepository } from '@infrastructure/persistence/repositories/AuditLogRepository';
import { AesEncryptionService } from '@infrastructure/encryption/AesEncryptionService';
import { CreateSecretDto, UpdateSecretDto } from '@application/dtos/SecretDto';

export class SecretController {
  private createUseCase: CreateSecretUseCase;
  private getUseCase: GetSecretsUseCase;
  private getValueUseCase: GetSecretValueUseCase;
  private updateUseCase: UpdateSecretUseCase;
  private rotateUseCase: RotateSecretUseCase;
  private deleteUseCase: DeleteSecretUseCase;
  private logsUseCase: GetSecretAccessLogsUseCase;

  constructor() {
    const repository = new SecretRepository();
    const auditRepository = new AuditLogRepository();
    const encryptionService = new AesEncryptionService();
    
    this.createUseCase = new CreateSecretUseCase(repository, encryptionService, auditRepository);
    this.getUseCase = new GetSecretsUseCase(repository);
    this.getValueUseCase = new GetSecretValueUseCase(repository, encryptionService, auditRepository);
    this.updateUseCase = new UpdateSecretUseCase(repository, encryptionService, auditRepository);
    this.rotateUseCase = new RotateSecretUseCase(repository, encryptionService, auditRepository);
    this.deleteUseCase = new DeleteSecretUseCase(repository, auditRepository);
    this.logsUseCase = new GetSecretAccessLogsUseCase(repository);
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto: CreateSecretDto = req.body;
      const userId = (req as any).user?.userId;
      const ipAddress = req.ip;
      const result = await this.createUseCase.execute(dto, userId, ipAddress);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  findAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const { serviceId, search } = req.query;
      
      let results;
      if (search) {
        results = []; // TODO: implement search
      } else if (serviceId) {
        results = await this.getUseCase.executeByService(serviceId as string);
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
        res.status(404).json({ error: 'Secret not found' });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getValue = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const serviceId = (req as any).serviceId;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');
      
      const result = await this.getValueUseCase.execute(id, userId, serviceId, ipAddress, userAgent);
      if (!result) {
        res.status(404).json({ error: 'Secret not found' });
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
      const dto: UpdateSecretDto = req.body;
      const userId = (req as any).user?.userId;
      const ipAddress = req.ip;
      
      const result = await this.updateUseCase.execute(id, dto, userId, ipAddress);
      if (!result) {
        res.status(404).json({ error: 'Secret not found' });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  rotate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { newValue } = req.body;
      const userId = (req as any).user?.userId;
      const ipAddress = req.ip;
      
      if (!newValue) {
        res.status(400).json({ error: 'newValue is required' });
        return;
      }
      
      const result = await this.rotateUseCase.execute(id, newValue, userId, ipAddress);
      if (!result) {
        res.status(404).json({ error: 'Secret not found' });
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
      const ipAddress = req.ip;
      
      const success = await this.deleteUseCase.execute(id, userId, ipAddress);
      if (!success) {
        res.status(404).json({ error: 'Secret not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  getAccessLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { limit } = req.query;
      
      const results = await this.logsUseCase.execute(id, limit ? parseInt(limit as string) : 100);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
