import { NextFunction, Request, Response } from 'express';

import ErrorResponse from '../utils/errorResponse';

type TCustomError = Error & {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  path?: string;
  value?: any;
  code?: number;
  errors?: { [key: string]: { message: string } };
  errmsg?: string;
};

const handleCastErrorDB = (err: TCustomError): ErrorResponse => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new ErrorResponse(message, 400);
};

const handleDuplicateFieldsDB = (err: TCustomError): ErrorResponse => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ErrorResponse(message, 400);
};

const handleValidationErrorDB = (err: TCustomError): ErrorResponse => {
  const message = Object.values(err.errors || {}).map(el => el.message);
  return new ErrorResponse(message.join('. '), 400);
};

const handleJWTError = (): ErrorResponse =>
  new ErrorResponse('Invalid token, Please login again!', 401);

const handleJWTExpiredError = (): ErrorResponse =>
  new ErrorResponse('Your token has been expired! Please login again.', 401);

const sendErrorDev = (err: TCustomError, res: Response): void => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err: TCustomError, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message
    });
    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    res.status(500).json({
      success: false,
      message: 'Something went very wrong!'
    });
  }
};

const errorHandler = (
  err: TCustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.message = err.message || 'Server Error';

  if (
    process.env.NODE_ENV === 'test' ||
    process.env.NODE_ENV === 'development'
  ) {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error: TCustomError = Object.create(err);

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }

    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }

    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, res);
  }
};

export default errorHandler;
