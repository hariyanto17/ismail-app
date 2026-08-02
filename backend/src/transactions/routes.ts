import { Router } from 'express';
import { TransactionController } from './controller';
import { TransactionService } from './service';
import { TransactionRepository } from './repository';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTransactionSchema } from './validation';
import { Role } from '@prisma/client';

const router = Router();

const transactionRepository = new TransactionRepository();
const transactionService = new TransactionService(transactionRepository);
const transactionController = new TransactionController(transactionService);

router.use(authenticate, authorize([Role.ADMIN, Role.CASHIER]));

router.get('/', transactionController.getAll);
router.get('/:id', transactionController.getById);
router.post('/', validate(createTransactionSchema), transactionController.create);

export default router;
