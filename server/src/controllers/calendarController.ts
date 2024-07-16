import { TypeCompiler } from '@sinclair/typebox/compiler';
import { NextFunction, Request, Response } from 'express';

import knex from '../db/knex';
import asyncHandler from '../middlewares/async';
import { CalendarSchema } from '../schemas/calendarSchema';

const validateCalendar = TypeCompiler.Compile(CalendarSchema);

export const getCalendars = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await knex('Users').select('*');

    res.status(200).json(users);
  }
);

export const createCalendar = async (req: Request, res: Response) => {
  const newCalendar = req.body;

  if (validateCalendar.Check(newCalendar)) {
    try {
      await knex('Calendars').insert(newCalendar);

      res.status(201).json({ message: 'Calendar created successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(400).json({
      error: 'Validation failed',
      details: validateCalendar.Errors(newCalendar)
    });
  }
};
