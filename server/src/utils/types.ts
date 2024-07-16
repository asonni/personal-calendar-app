import { Request } from 'express';

import { TUserSchema } from '../schemas/userSchema';

export type TAuthenticatedRequest = Request & {
  user?: TUserSchema;
};
