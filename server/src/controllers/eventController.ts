import { NextFunction, Response } from 'express';

import db from '../db/knex';
import ErrorResponse from '../utils/errorResponse';
import { queryWithHelpers } from '../utils/queryHelpers';
import { TAuthenticatedRequest } from '../utils/types';

export const getEvent = async (
  req: TAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const event = await db('Events')
      .join('Calendars', 'Events.calendarId', '=', 'Calendars.calendarId')
      .join('Users', 'Calendars.userId', '=', 'Users.userId')
      .where({
        'Calendars.calendarId': req.params.calendarId,
        'Calendars.userId': req.user?.userId,
        'Events.eventId': req.params.eventId
      })
      .select(
        'Events.*',
        'Calendars.name as calendarName',
        'Calendars.description as calendarDescription',
        'Users.userId as userId',
        'Users.firstName as userFirstName',
        'Users.lastName as userLastName',
        'Users.email as userEmail'
      )
      .first();

    if (!event) {
      return next(new ErrorResponse('Event not found', 404));
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    return next(new ErrorResponse('Event not found', 404));
  }
};

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
      .join('Users', 'Calendars.userId', '=', 'Users.userId')
      .where({
        'Calendars.userId': req.user?.userId,
        'Calendars.calendarId': req.params.calendarId
      })
      .select(
        'Events.*',
        'Calendars.name as calendarName',
        'Calendars.description as calendarDescription',
        'Users.userId as userId',
        'Users.firstName as userFirstName',
        'Users.lastName as userLastName',
        'Users.email as userEmail'
      );

    const events = await queryWithHelpers(query, options);

    res.status(200).json(events);
  } catch (error) {
    return next(new ErrorResponse('Failed to get events', 400));
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
    return next(new ErrorResponse('Failed to create event', 400));
  }
};

export const updateEvent = async (
  req: TAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId, ...rest } = req.body;
  const { calendarId, eventId } = req.params;

  try {
    const calendar = await db('Calendars')
      .where({ userId, calendarId })
      .select('*')
      .first();

    if (!calendar) {
      return next(new ErrorResponse(`Event not found`, 404));
    }

    const event = await db('Events')
      .update({
        ...rest,
        updatedAt: new Date()
      })
      .where({
        calendarId,
        eventId
      });

    if (!event) {
      return next(new ErrorResponse(`Event not found`, 404));
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.log({ error });
    return next(new ErrorResponse('Failed to update event', 400));
  }
};

export const deleteEvent = async (
  req: TAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { calendarId, eventId } = req.params;

    const event = await db('Events').where({ calendarId, eventId }).del();

    if (!event) {
      return next(new ErrorResponse(`Event not found`, 404));
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      data: eventId
    });
  } catch (error) {
    return next(new ErrorResponse('Failed to delete event', 400));
  }
};
