import { NextFunction, Response } from 'express';

import db from '../db/knex';
import ErrorResponse from '../utils/errorResponse';
import { queryWithHelpers } from '../utils/queryHelpers';
import { TAuthenticatedRequest } from '../utils/types';

export const getEvents = async (
  req: TAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const options = {
    page: parseInt(req.query.page as string, 10) || 1,
    pageSize: parseInt(req.query.pageSize as string, 10) || 10,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as 'asc' | 'desc',
    searchBy: req.query.searchBy as string,
    searchValue: req.query.searchValue as string,
    filterBy: req.query.filterBy as string,
    filterValue: req.query.filterValue as string
  };
  try {
    const query = db('Events')
      .join('Calendars', 'Events.calendarId', '=', 'Calendars.calendarId')
      .where('Calendars.calendarId', req.params.calendarId)
      .where('Calendars.userId', req.user.userId)
      .select('Events.*');

    const events = await queryWithHelpers(query, options);

    res.status(200).json(events);
  } catch (error) {
    return next(
      new ErrorResponse(
        `Something went wrong, please try again later ${error}`,
        400
      )
    );
  }
};

export const createEvent = async (
  req: TAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId, ...rest } = req.body;

  try {
    await db('Events').insert(rest);
    res
      .status(201)
      .json({ success: true, message: 'Event created successfully' });
  } catch (error) {
    return next(
      new ErrorResponse(`Something went wrong, please try again later`, 400)
    );
  }
};
