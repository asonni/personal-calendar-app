import { Router } from 'express';

import {
  createEvent,
  deleteEvent,
  getEvent,
  getEvents,
  updateEvent
} from '../controllers/eventController';
import { protect } from '../middlewares/auth';
import validate from '../middlewares/validate';
import { EventSchema } from '../schemas/eventSchema';

const router = Router({ mergeParams: true });

router
  .route('/')
  .get(protect, getEvents)
  .post(protect, validate(EventSchema), createEvent);

router
  .route('/:eventId')
  .get(protect, getEvent)
  .put(protect, validate(EventSchema), updateEvent)
  .delete(protect, deleteEvent);

export default router;
