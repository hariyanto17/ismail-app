import { Router } from 'express';
import { ReportController } from './controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();
const reportController = new ReportController();

// Protect all routes with auth middleware
router.use(authenticate);

// Viewing reports: both ADMIN and CASHIER
router.get('/daily', authorize([Role.ADMIN, Role.CASHIER]), reportController.getDailyReport);
router.get('/analytics', authorize([Role.ADMIN]), reportController.getAnalyticsReport);

// Preview endpoints: ADMIN only
router.get('/daily/preview', authorize([Role.ADMIN]), reportController.previewDailyReport);
router.get('/closing/preview', authorize([Role.ADMIN]), reportController.previewClosingReport);

// Manual report triggers: ADMIN only
router.post('/daily/send', authorize([Role.ADMIN]), reportController.sendDailyReport);
router.post('/closing/send', authorize([Role.ADMIN]), reportController.sendClosingReport);

export default router;
