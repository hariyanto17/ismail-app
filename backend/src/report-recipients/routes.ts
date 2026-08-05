import { Router } from 'express';
import { ReportRecipientController } from './controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();
const controller = new ReportRecipientController();

router.use(authenticate);

// Authenticated users may view the list
router.get('/', authorize([Role.ADMIN, Role.CASHIER]), (req, res) => controller.getAll(req, res));

// Only ADMIN users may modify recipients
router.post('/', authorize([Role.ADMIN]), (req, res) => controller.create(req, res));
router.put('/:id', authorize([Role.ADMIN]), (req, res) => controller.update(req, res));
router.delete('/:id', authorize([Role.ADMIN]), (req, res) => controller.delete(req, res));

export default router;
