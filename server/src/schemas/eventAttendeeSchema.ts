import { Type } from '@sinclair/typebox';

import { STATUS } from '../utils/enums';

export const EventAttendeeSchema = Type.Object({
  eventId: Type.String({ format: 'uuid' }),
  userId: Type.String({ format: 'uuid' }),
  status: Type.Enum(STATUS)
});
