import { Type } from '@sinclair/typebox';

import { STATUS } from '../utils/enums';

export const EventAttendeeSchema = Type.Object({
  eventId: Type.Integer(),
  userId: Type.Integer(),
  status: Type.Enum(STATUS)
});
