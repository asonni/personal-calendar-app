import { Static, Type } from '@sinclair/typebox';

export const EventSchema = Type.Object({
  eventId: Type.Optional(Type.String({ format: 'uuid' })),
  calendarId: Type.String({ format: 'uuid' }),
  title: Type.String(),
  description: Type.Optional(Type.String()),
  location: Type.Optional(Type.String()),
  startTime: Type.String({ format: 'date-time' }),
  endTime: Type.String({ format: 'date-time' }),
  allDay: Type.Optional(Type.Boolean()),
  color: Type.Optional(Type.String({ maxLength: 7 })),
  createdAt: Type.Optional(Type.String({ format: 'date-time' })),
  updatedAt: Type.Optional(Type.String({ format: 'date-time' }))
});

export type TEventSchema = Static<typeof EventSchema>;
