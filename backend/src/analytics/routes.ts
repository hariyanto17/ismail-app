import { Router } from 'express';
import { AnalyticsController } from './controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();
const controller = new AnalyticsController();

router.use(authenticate);

router.get('/daily', authorize([Role.ADMIN]), controller.getDailyAnalytics);
router.get('/monthly', authorize([Role.ADMIN]), controller.getMonthlyAnalytics);
router.post('/rebuild', authorize([Role.ADMIN]), controller.rebuildAnalytics);

export default router;
