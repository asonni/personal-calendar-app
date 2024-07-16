import { Type } from '@sinclair/typebox';

import { ROLES, STATUS } from '../utils/enums';

export const SharedCalendarSchema = Type.Object({
  calendarId: Type.Integer(),
  userId: Type.Integer(),
  role: Type.Enum(ROLES),
  status: Type.Enum(STATUS)
});
