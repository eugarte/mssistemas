import { Router } from 'express';
import { CatalogController } from '../controllers/CatalogController';
import { authMiddleware, requireRoles } from '../middleware/AuthMiddleware';

const router = Router();
const controller = new CatalogController();

// Public routes
router.get('/', controller.findAll);
router.get('/:key/values', controller.findValuesByKey);

// Protected routes
router.post('/', authMiddleware, requireRoles('admin', 'developer'), controller.create);
router.get('/:id', authMiddleware, controller.findById);
router.put('/:id', authMiddleware, requireRoles('admin', 'developer'), controller.update);
router.delete('/:id', authMiddleware, requireRoles('admin'), controller.delete);

// Values routes
router.post('/:id/values', authMiddleware, requireRoles('admin', 'developer'), controller.createValue);
router.get('/:id/values', authMiddleware, controller.findValues);
router.put('/values/:valueId', authMiddleware, requireRoles('admin', 'developer'), controller.updateValue);
router.delete('/values/:valueId', authMiddleware, requireRoles('admin'), controller.deleteValue);

export default router;
