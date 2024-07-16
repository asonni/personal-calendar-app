import { Type } from '@sinclair/typebox';

import { ROLES, STATUS } from '../utils/enums';

export const SharedCalendarSchema = Type.Object({
  calendarId: Type.String({ format: 'uuid' }),
  userId: Type.String({ format: 'uuid' }),
  role: Type.Enum(ROLES),
  status: Type.Enum(STATUS)
});
