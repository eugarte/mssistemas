import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Root endpoint
router.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'mssistemas',
    version: '1.0.0',
    description: 'Microservicio de Catálogo y Configuración Centralizada'
  });
});

export default router;
