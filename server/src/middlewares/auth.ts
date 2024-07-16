import knex from 'db/knex';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

import ErrorResponse from '../utils/errorResponse';
import asyncHandler from './async';

interface TDecodedToken {
  id: string;
  iat: number;
}

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Protect routes
export const protect = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;
    const authorization = req.headers.authorization;

    if (authorization && authorization.startsWith('Bearer')) {
      // Set token from Bearer token in header
      [, token] = authorization.split(' ');
      // Set token from cookie
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return next(
        new ErrorResponse('Not authorized to access this route', 401)
      );
    }

    try {
      // Verify token
      const jwtVerifyPromisified = (token: string, secret: Secret) => {
        return new Promise((resolve, reject) => {
          jwt.verify(token, secret, {}, (err, payload) => {
            if (err) {
              reject(err);
            } else {
              resolve(payload);
            }
          });
        });
      };

      const decoded: JwtPayload = await jwtVerifyPromisified(
        token,
        process.env.JWT_SECRET
      );

      const currentUser = await knex('Users')
        .where({ userId: decoded.id })
        .first();

      if (!currentUser) {
        return next(
          new ErrorResponse(
            'The user belonging to this token no longer exists.',
            401
          )
        );
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
          new ErrorResponse(
            'User recently changed password! Please login again.',
            401
          )
        );
      }

      req.user = currentUser;

      return next();
    } catch (error) {
      return next(
        new ErrorResponse('Not authorized to access this route', 401)
      );
    }
  }
);

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    return next();
  };
};
