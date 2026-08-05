import { Router } from 'express';
import { AppSettingController } from './controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();
const controller = new AppSettingController();

router.use(authenticate);

// Authenticated users can view settings
router.get('/', (req, res) => controller.get(req, res));

// Only Admins can modify settings
router.put('/', authorize([Role.ADMIN]), (req, res) => controller.update(req, res));

export default router;
