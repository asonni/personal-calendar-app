import { NextFunction, Response } from 'express';
import validator from 'validator';

import db from '../db/knex';
import asyncHandler from '../middlewares/async';
import ErrorResponse from '../utils/errorResponse';
import { queryWithHelpers } from '../utils/queryHelpers';
import { TAuthenticatedRequest } from '../utils/types';

export const getCalendar = asyncHandler(
  async (req: TAuthenticatedRequest, res: Response, next: NextFunction) => {
    const { calendarId } = req.params;

    if (!validator.isUUID(calendarId)) {
      return next(new ErrorResponse('Calendar ID is not valid', 400));
    }

    const calendar = await db('Calendars')
      .join('Users', 'Calendars.userId', '=', 'Users.userId')
      .where({
        'Calendars.userId': req.user?.userId,
        'Calendars.calendarId': calendarId
      })
      .select(
        'Calendars.*',
        'Users.firstName as userFirstName',
        'Users.lastName as userLastName',
        'Users.email as userEmail'
      )
      .first();

    if (!calendar) {
      return next(new ErrorResponse('Calendar not found', 404));
    }

    res.status(200).json({ success: true, data: calendar });
  }
);

export const getCalendars = asyncHandler(
  async (req: TAuthenticatedRequest, res: Response, next: NextFunction) => {
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

    const query = db('Calendars')
      .join('Users', 'Calendars.userId', '=', 'Users.userId')
      .where({ 'Calendars.userId': req.user?.userId })
      .select(
        'Calendars.*',
        'Users.firstName as userFirstName',
        'Users.lastName as userLastName',
        'Users.email as userEmail'
      );

    const calendars = await queryWithHelpers(query, options);

    res.status(200).json(calendars);
  }
);

export const createCalendar = asyncHandler(
  async (req: TAuthenticatedRequest, res: Response, next: NextFunction) => {
    const [calendar] = await db('Calendars').insert(req.body).returning('*');

    if (!calendar) {
      return next(new ErrorResponse('Failed to create calendar', 400));
    }

    res.status(201).json({
      success: true,
      message: 'Calendar created successfully',
      data: calendar
    });
  }
);

export const updateCalendar = asyncHandler(
  async (req: TAuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const { calendarId } = req.params;

    if (!validator.isUUID(calendarId)) {
      return next(new ErrorResponse('Calendar ID is not valid', 400));
    }

    const foundedCalendar = await db('Calendars')
      .where({ userId, calendarId })
      .select('*')
      .first();

    if (!foundedCalendar) {
      return next(new ErrorResponse('Calendar not found', 404));
    }

    const [calendar] = await db('Calendars')
      .update({
        ...req.body,
        updatedAt: new Date()
      })
      .where({ calendarId, userId })
      .returning('*');

    if (!calendar) {
      return next(new ErrorResponse('Failed to update calendar', 400));
    }

    res.status(200).json({
      success: true,
      message: 'Calendar updated successfully',
      data: calendar
    });
  }
);

export const deleteCalendar = asyncHandler(
  async (req: TAuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const { calendarId } = req.params;

    if (!validator.isUUID(calendarId)) {
      return next(new ErrorResponse('Calendar ID is not valid', 400));
    }

    const foundedCalendar = await db('Calendars')
      .where({ userId, calendarId })
      .select('*')
      .first();

    if (!foundedCalendar) {
      return next(new ErrorResponse('Calendar not found', 404));
    }

    const calendar = await db('Calendars')
      .where({ calendarId, userId: req.user?.userId })
      .del();

    if (!calendar) {
      return next(new ErrorResponse('Failed to delete calendar', 400));
    }

    res.status(200).json({
      success: true,
      message: 'Calendar deleted successfully',
      data: calendarId
    });
  }
);
