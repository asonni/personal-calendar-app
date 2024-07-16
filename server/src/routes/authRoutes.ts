import { Router } from 'express';

import {
  forgotPassword,
  login,
  register,
  resetPassword
} from '../controllers/authController';
import validate from '../middlewares/validate';
import { UserSchema } from '../schemas/userSchema';

const router = Router();

router.post('/register', validate(UserSchema), register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

export default router;
