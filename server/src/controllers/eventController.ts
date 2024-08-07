import { NextFunction, Response } from 'express';
import validator from 'validator';

import db from '../db/knex';
import asyncHandler from '../middlewares/async';
import ErrorResponse from '../utils/errorResponse';
import { queryWithHelpers } from '../utils/queryHelpers';
import { TAuthenticatedRequest } from '../utils/types';

export const getEvent = asyncHandler(
  async (req: TAuthenticatedRequest, res: Response, next: NextFunction) => {
    const { calendarId, eventId } = req.params;

    if (!validator.isUUID(calendarId)) {
      return next(new ErrorResponse('Calendar ID is not valid', 400));
    }

    if (!validator.isUUID(eventId)) {
      return next(new ErrorResponse('Event ID is not valid', 400));
    }

    const event = await db('Events')
      .join('Calendars', 'Events.calendarId', '=', 'Calendars.calendarId')
      .join('Users', 'Calendars.userId', '=', 'Users.userId')
      .where({
        'Calendars.calendarId': calendarId,
        'Calendars.userId': req.user?.userId,
        'Events.eventId': eventId
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
  }
);

export const getEvents = asyncHandler(
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
  }
);

export const createEvent = asyncHandler(
  async (req: TAuthenticatedRequest, res: Response, next: NextFunction) => {
    const { userId, ...rest } = req.body;

    if (!validator.isUUID(rest.calendarId)) {
      return next(new ErrorResponse('Calendar ID is not valid', 400));
    }

    const [event] = await db('Events').insert(rest).returning('*');

    if (!event) {
      return next(new ErrorResponse('Failed to create event', 400));
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  }
);

export const updateEvent = asyncHandler(
  async (req: TAuthenticatedRequest, res: Response, next: NextFunction) => {
    const { userId, ...rest } = req.body;
    const { calendarId, eventId } = req.params;

    if (!validator.isUUID(calendarId)) {
      return next(new ErrorResponse('Calendar ID is not valid', 400));
    }

    if (!validator.isUUID(eventId)) {
      return next(new ErrorResponse('Event ID is not valid', 400));
    }

    const foundedCalendar = await db('Calendars')
      .where({ userId, calendarId })
      .select('*')
      .first();

    if (!foundedCalendar) {
      return next(new ErrorResponse('Calendar not found', 404));
    }

    const foundedEvent = await db('Events')
      .where({ calendarId, eventId })
      .select('*')
      .first();

    if (!foundedEvent) {
      return next(new ErrorResponse('Event not found', 404));
    }

    const [event] = await db('Events')
      .update({
        ...rest,
        updatedAt: new Date()
      })
      .where({
        calendarId,
        eventId
      })
      .returning('*');

    if (!event) {
      return next(new ErrorResponse('Failed to update event', 400));
    }

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  }
);

export const deleteEvent = asyncHandler(
  async (req: TAuthenticatedRequest, res: Response, next: NextFunction) => {
    const { calendarId, eventId } = req.params;

    if (!validator.isUUID(calendarId)) {
      return next(new ErrorResponse('Calendar ID is not valid', 400));
    }

    if (!validator.isUUID(eventId)) {
      return next(new ErrorResponse('Event ID is not valid', 400));
    }

    const foundedEvent = await db('Events')
      .where({ calendarId, eventId })
      .select('*')
      .first();

    if (!foundedEvent) {
      return next(new ErrorResponse('Event not found', 404));
    }

    const event = await db('Events').where({ calendarId, eventId }).del();

    if (!event) {
      return next(new ErrorResponse('Failed to delete event', 400));
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      data: eventId
    });
  }
);
