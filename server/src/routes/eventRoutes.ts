import { Router } from 'express';

import { createEvent, getEvents } from '../controllers/eventController';
import { protect } from '../middlewares/auth';
import validate from '../middlewares/validate';
import { EventSchema } from '../schemas/eventSchema';

const router = Router({ mergeParams: true });

router
  .route('/')
  .get(protect, getEvents)
  .post(protect, validate(EventSchema), createEvent);

export default router;
