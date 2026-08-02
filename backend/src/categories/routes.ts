import { Router } from 'express';
import { CategoryController } from './controller';
import { CategoryService } from './service';
import { CategoryRepository } from './repository';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from './validation';
import { Role } from '@prisma/client';

const router = Router();

const categoryRepository = new CategoryRepository();
const categoryService = new CategoryService(categoryRepository);
const categoryController = new CategoryController(categoryService);

router.use(authenticate);

// Cashiers & Admins can read categories
router.get('/', authorize([Role.ADMIN, Role.CASHIER]), categoryController.getAll);
router.get('/:id', authorize([Role.ADMIN, Role.CASHIER]), categoryController.getById);

// Only Admins can modify categories
router.post('/', authorize([Role.ADMIN]), validate(createCategorySchema), categoryController.create);
router.put('/:id', authorize([Role.ADMIN]), validate(updateCategorySchema), categoryController.update);
router.delete('/:id', authorize([Role.ADMIN]), categoryController.delete);

export default router;
