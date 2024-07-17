import { Router } from 'express';

import {
  createCalendar,
  deleteCalendar,
  getCalendar,
  getCalendars,
  updateCalendar
} from '../controllers/calendarController';
import { protect } from '../middlewares/auth';
import validate from '../middlewares/validate';
import { CalendarSchema } from '../schemas/calendarSchema';
import eventRoutes from './eventRoutes';

const router = Router();

// Re-route into other resource routers
router.use('/:calendarId/events', eventRoutes);

router
  .route('/')
  .get(protect, getCalendars)
  .post(protect, validate(CalendarSchema), createCalendar);

router
  .route('/:calendarId')
  .get(protect, getCalendar)
  .put(protect, validate(CalendarSchema), updateCalendar)
  .delete(protect, deleteCalendar);

export default router;
