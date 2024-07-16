import { Router } from 'express';

import {
  forgotPassword,
  getMe,
  login,
  register,
  resetPassword
} from '../controllers/authController';
import { protect } from '../middlewares/auth';
import validate from '../middlewares/validate';
import { UserSchema } from '../schemas/userSchema';

const router = Router();

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/register', validate(UserSchema), register);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

export default router;
