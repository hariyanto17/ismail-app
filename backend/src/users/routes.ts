import { Router } from 'express';
import { UserController } from './controller';
import { UserService } from './service';
import { UserRepository } from './repository';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema } from './validation';
import { Role } from '@prisma/client';

const router = Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// All user management routes require admin rights
router.use(authenticate, authorize([Role.ADMIN]));

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', validate(createUserSchema), userController.create);
router.put('/:id', validate(updateUserSchema), userController.update);
router.delete('/:id', userController.delete);

export default router;
