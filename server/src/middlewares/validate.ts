import { NextFunction, Response } from 'express';

import { getSchemaErrors, validateSchema } from '../utils/customValidator';
import ErrorResponse from '../utils/errorResponse';
import { TAuthenticatedRequest } from '../utils/types';

const validate = (schema: any) => {
  return (req: TAuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!!req.user) {
      req.body.userId = req.user.userId;
    }
    if (req.params.calendarId) {
      req.body.calendarId = req.params.calendarId;
    }
    const isValid = validateSchema(schema, req.body);
    if (!isValid) {
      return next(new ErrorResponse(getSchemaErrors(schema, req.body), 400));
    }
    next();
  };
};

export default validate;
