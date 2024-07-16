import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Request, Response } from 'express';

import knex from '../db/knex';
import { EventSchema } from '../schemas/eventSchema';

const validateEvent = TypeCompiler.Compile(EventSchema);

export const createEvent = async (req: Request, res: Response) => {
  const newEvent = req.body;

  if (validateEvent.Check(newEvent)) {
    try {
      await knex('Events').insert(newEvent);
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
