import { Router } from 'express';

import {
  createCalendar,
  getCalendars
} from '../controllers/calendarController';

const router = Router();

router.get('/', getCalendars);
router.post('/', createCalendar);

export default router;
