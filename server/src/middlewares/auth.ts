import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

import knex from '../db/knex';
import { TUserSchema } from '../schemas/userSchema';
import asyncHandler from './async';

type TCustomJwtPayload = JwtPayload & {
  userId: number;
  iat: number;
};

// Protect routes
export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    const authorization = req.headers.authorization;

    if (authorization && authorization.startsWith('Bearer')) {
      // Set token from Bearer token in header
      token = authorization.split(' ')[1];
      // Set token from cookie
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
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

      const decoded = (await jwtVerifyPromisified(
        token,
        process.env.JWT_SECRET
      )) as TCustomJwtPayload;

      const currentUser: TUserSchema = await knex('Users')
        .where({ userId: decoded.id })
        .first();

      if (!currentUser) {
        return res.status(401).json({
          error: 'The user belonging to this token no longer exists.'
        });
      }

      if (
        currentUser.passwordChangedAt &&
        decoded.iat * 1000 < new Date(currentUser.passwordChangedAt).getTime()
      ) {
        return res.status(401).json({
          error: 'User recently changed password! Please login again.'
        });
      }

      (req as any).user = currentUser;

      return next();
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
  }
);
