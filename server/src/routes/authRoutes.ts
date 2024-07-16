import { Router } from 'express';

import {
  login,
  register,
  requestPasswordReset,
  resetPassword
} from '../controllers/authController';
import validate from '../middlewares/validate';
import { UserSchema } from '../schemas/userSchema';

const router = Router();

router.post('/register', validate(UserSchema), register);
router.post('/login', login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
