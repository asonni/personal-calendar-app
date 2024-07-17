import { NextFunction, Response } from 'express';

import db from '../db/knex';
import ErrorResponse from '../utils/errorResponse';
import { queryWithHelpers } from '../utils/queryHelpers';
import { TAuthenticatedRequest } from '../utils/types';

export const getCalendar = async (
  req: TAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const calendar = await db('Calendars')
      .join('Users', 'Calendars.userId', '=', 'Users.userId')
      .where({
        'Calendars.userId': req.user.userId,
        'Calendars.calendarId': req.params.calendarId
      })
      .select(
        'Calendars.*',
        'Users.firstName as userFirstName',
        'Users.lastName as userLastName',
        'Users.email as userEmail'
      )
      .first();

    if (!calendar) {
      return next(new ErrorResponse(`Calendar not found`, 404));
    }

    res.status(200).json({ success: true, data: calendar });
  } catch (error) {
    return next(
      new ErrorResponse(`Something went wrong, please try again later`, 400)
    );
  }
};

export const getCalendars = async (
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
    const query = db('Calendars')
      .join('Users', 'Calendars.userId', '=', 'Users.userId')
      .where({ 'Calendars.userId': req.user.userId })
      .select(
        'Calendars.*',
        'Users.firstName as userFirstName',
        'Users.lastName as userLastName',
        'Users.email as userEmail'
      );

    const calendars = await queryWithHelpers(query, options);

    res.status(200).json(calendars);
  } catch (error) {
    return next(
      new ErrorResponse(`Something went wrong, please try again later`, 400)
    );
  }
};

export const createCalendar = async (
  req: TAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await db('Calendars').insert(req.body);

    res
      .status(201)
      .json({ success: true, message: 'Calendar created successfully' });
  } catch (error) {
    return next(
      new ErrorResponse(`Something went wrong, please try again later`, 400)
    );
  }
};

export const updateCalendar = async (
  req: TAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.userId;
  const calendarId = req.params.calendarId;

  try {
    const calendar = await db('Calendars')
      .update({
        ...req.body,
        updatedAt: new Date()
      })
      .where({ calendarId, userId });

    if (!calendar) {
      return next(new ErrorResponse(`Calendar not found`, 404));
    }

    res.status(200).json({
      success: true,
      message: 'Calendar updated successfully'
    });
  } catch (error) {
    return next(
      new ErrorResponse(`Something went wrong, please try again later`, 400)
    );
  }
};

export const deleteCalendar = async (
  req: TAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const calendarId = req.params.calendarId;

    const calendar = await db('Calendars')
      .where({ calendarId, userId: req.user.userId })
      .del();

    if (!calendar) {
      return next(new ErrorResponse(`Calendar not found`, 404));
    }

    res.status(200).json({
      success: true,
      message: 'Calendar deleted successfully',
      data: calendarId
    });
  } catch (error) {
    return next(
      new ErrorResponse(`Something went wrong, please try again later`, 400)
    );
  }
};
