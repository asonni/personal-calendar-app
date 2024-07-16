import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Request, Response } from 'express';

import db from '../db/knex';
import { EventSchema } from '../schemas/eventSchema';
import { TAuthenticatedRequest } from '../utils/types';

const validateEvent = TypeCompiler.Compile(EventSchema);

export const getEvents = async (req: TAuthenticatedRequest, res: Response) => {
  try {
    const events = await db('Events')
      .join('Calendars', 'Events.calendarId', '=', 'Calendars.calendarId')
      .where({ calendarId: req.user.userId })
      .select('*');

    res.status(200).json({ data: events });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  const newEvent = req.body;

  if (validateEvent.Check(newEvent)) {
    try {
      await db('Events').insert(newEvent);
      res.status(201).json({ message: 'Event created successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(400).json({
      error: 'Validation failed',
      details: validateEvent.Errors(newEvent)
    });
  }
};
