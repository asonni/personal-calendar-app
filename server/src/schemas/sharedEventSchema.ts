import { Type } from '@sinclair/typebox';

import { ROLES, STATUS } from '../utils/enums';

export const SharedEventSchema = Type.Object({
  eventId: Type.Integer(),
  userId: Type.Integer(),
  role: Type.Enum(ROLES),
  status: Type.Enum(STATUS)
});
