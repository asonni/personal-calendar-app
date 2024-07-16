import { Router } from 'express';

import {
  createCalendar,
  getCalendars
} from '../controllers/calendarController';
import { protect } from '../middlewares/auth';
import validate from '../middlewares/validate';
import { CalendarSchema } from './../schemas/calendarSchema';

const router = Router();

router.get('/', protect, getCalendars);
router.post('/', protect, validate(CalendarSchema), createCalendar);

export default router;
