import { Static, Type } from '@sinclair/typebox';

import { ROLES, STATUS } from '../utils/enums';

export const SharedEventSchema = Type.Object({
  eventId: Type.String({ format: 'uuid' }),
  userId: Type.String({ format: 'uuid' }),
  ownerId: Type.String({ format: 'uui' }),
  role: Type.Enum(ROLES),
  status: Type.Enum(STATUS)
});

export type TSharedEventSchema = Static<typeof SharedEventSchema>;
