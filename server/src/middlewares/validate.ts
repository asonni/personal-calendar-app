import { NextFunction, Response } from 'express';

import { getSchemaErrors, validateSchema } from '../utils/customValidator';
import { TAuthenticatedRequest } from '../utils/types';

const validate = (schema: any) => {
  return (req: TAuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!!req.user.userId) {
      req.body.userId = req.user.userId;
    }
    const isValid = validateSchema(schema, req.body);
    if (!isValid) {
      return res.status(400).json({ error: getSchemaErrors(schema, req.body) });
    }
    next();
  };
};

export default validate;
