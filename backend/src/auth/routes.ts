import { Router } from 'express';
import { AuthController } from './controller';
import { AuthService } from './service';
import { AuthRepository } from './repository';
import { validate } from '../middleware/validate';
import { loginSchema, refreshSchema } from './validation';
import { authenticate } from '../middleware/auth';

const router = Router();

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authController.logout);
router.get('/profile', authenticate, authController.getProfile);

export default router;
