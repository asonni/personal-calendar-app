import { Response } from 'express';

import knex from '../db/knex';
import { TAuthenticatedRequest } from '../utils/types';

export const getCalendars = async (
  req: TAuthenticatedRequest,
  res: Response
) => {
  try {
    const calendars = await knex('Calendars')
      .select('*')
      .where({ userId: req.user.userId });

    res.status(200).json({ data: calendars });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const createCalendar = async (
  req: TAuthenticatedRequest,
  res: Response
) => {
  const newCalendar = req.body;
  newCalendar.userId = 1;

  try {
    await knex('Calendars').insert(newCalendar);

    res.status(201).json({ message: 'Calendar created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};
