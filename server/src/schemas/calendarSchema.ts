import { Type } from '@sinclair/typebox';

export const CalendarSchema = Type.Object({
  calendarId: Type.Optional(Type.String({ format: 'uuid' })),
  userId: Type.String({ format: 'uuid' }),
  name: Type.String(),
  description: Type.Optional(Type.String()),
  color: Type.Optional(Type.String({ maxLength: 7 })),
  createdAt: Type.Optional(Type.String({ format: 'date-time' })),
  updatedAt: Type.Optional(Type.String({ format: 'date-time' }))
});
