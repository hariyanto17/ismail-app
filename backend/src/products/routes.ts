import { Router } from 'express';
import { ProductController } from './controller';
import { ProductService } from './service';
import { ProductRepository } from './repository';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from './validation';
import { Role } from '@prisma/client';

const router = Router();

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

router.use(authenticate);

// Cashiers & Admins can read products
router.get('/', authorize([Role.ADMIN, Role.CASHIER]), productController.getAll);
router.get('/:id', authorize([Role.ADMIN, Role.CASHIER]), productController.getById);

// Only Admins can modify products
router.post('/', authorize([Role.ADMIN]), validate(createProductSchema), productController.create);
router.put('/:id', authorize([Role.ADMIN]), validate(updateProductSchema), productController.update);
router.delete('/:id', authorize([Role.ADMIN]), productController.delete);

export default router;
