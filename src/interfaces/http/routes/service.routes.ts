import { Router } from 'express';
import { ServiceController } from '../controllers/ServiceController';
import { authMiddleware, requireRoles, optionalAuthMiddleware } from '../middleware/AuthMiddleware';

const router = Router();
const controller = new ServiceController();

// Protected routes
router.post('/', authMiddleware, requireRoles('admin', 'developer'), controller.create);
router.get('/', authMiddleware, controller.findAll);
router.get('/:id', authMiddleware, controller.findById);
router.get('/by-name/:name', authMiddleware, controller.findByName);
router.put('/:id', authMiddleware, requireRoles('admin', 'developer'), controller.update);
router.delete('/:id', authMiddleware, requireRoles('admin'), controller.delete);

// Heartbeat - optional auth (services can send with API key or JWT)
router.post('/:id/heartbeat', optionalAuthMiddleware, controller.heartbeat);
router.get('/:id/health', authMiddleware, controller.getHealth);

export default router;
