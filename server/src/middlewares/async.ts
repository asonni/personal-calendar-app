// Simple middleware for handling exceptions inside of async express routes and passing them to your express error handlers.
import { NextFunction, Request, Response } from 'express';

const asyncHandler =
  (fun: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction): Promise<void> =>
    Promise.resolve(fun(req, res, next)).catch(next);

export default asyncHandler;
