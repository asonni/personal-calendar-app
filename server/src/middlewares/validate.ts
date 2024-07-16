import { NextFunction, Request, Response } from 'express';

import { getSchemaErrors, validateSchema } from '../utils/customValidator';

const validate = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const isValid = validateSchema(schema, req.body);
    if (!isValid) {
      return res.status(400).json({ error: getSchemaErrors(schema, req.body) });
    }
    next();
  };
};

export default validate;
