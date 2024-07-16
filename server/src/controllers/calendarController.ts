import { Response } from 'express';

import db from '../db/knex';
import { paginate } from '../utils/pagination';
import { TAuthenticatedRequest } from '../utils/types';

export const getCalendars = async (
  req: TAuthenticatedRequest,
  res: Response
) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

  try {
    const query = db('Calendars')
      .join('Users', 'Calendars.userId', '=', 'Users.userId')
      .where('Calendars.userId', req.user.userId)
      .select(
        'Calendars.*',
        'Users.userId as userId',
        'Users.firstName as userFirstName',
        'Users.lastName as userLastName',
        'Users.email as userEmail'
      );

    const calendars = await paginate(query, page, pageSize);

    res.status(200).json(calendars);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
};

export const createCalendar = async (
  req: TAuthenticatedRequest,
  res: Response
) => {
  const newCalendar = req.body;
  newCalendar.userId = req.user.userId;

  try {
    await db('Calendars').insert(newCalendar);

    res
      .status(201)
      .json({ success: true, message: 'Calendar created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
};
