import { Router } from 'express';
import { HealthController } from './controller';

const router = Router();
const controller = new HealthController();

router.get('/ping', (req, res) => controller.ping(req, res));
router.get('/health', (req, res) => controller.health(req, res));

export default router;
