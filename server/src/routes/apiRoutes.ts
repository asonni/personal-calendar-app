import { Router } from 'express';

import authRoutes from './authRoutes';
import calendarRoutes from './calendarRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/calendars', calendarRoutes);

export default router;
