import { Type } from '@sinclair/typebox';

export const EventSchema = Type.Object({
  eventId: Type.String({ format: 'uuid' }),
  calendarId: Type.String({ format: 'uuid' }),
  title: Type.String(),
  description: Type.Optional(Type.String()),
  location: Type.Optional(Type.String()),
  startTime: Type.String({ format: 'date-time' }),
  endTime: Type.String({ format: 'date-time' }),
  allDay: Type.Optional(Type.Boolean()),
  recurrenceRule: Type.Optional(Type.String()),
  createdBy: Type.Integer(),
  createdAt: Type.Optional(Type.String({ format: 'date-time' })),
  updatedAt: Type.Optional(Type.String({ format: 'date-time' }))
});
