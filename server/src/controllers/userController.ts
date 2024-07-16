import { TypeCompiler } from '@sinclair/typebox/compiler';
import { NextFunction, Request, Response } from 'express';

import knex from '../db/knex';
import asyncHandler from '../middlewares/async';
import { UserSchema } from '../schemas/userSchema';
import ErrorResponse from '../utils/errorResponse';

const validateUser = TypeCompiler.Compile(UserSchema);

export const getUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await knex('Users').select('*');
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  }
);

export const getUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const user = await knex('Users').where({ userId }).first();

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  }
);

export const createUser = async (req: Request, res: Response) => {
  const newUser = req.body;

  if (validateUser.Check(newUser)) {
    try {
      await knex('Users').insert(newUser);
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(400).json({
      error: 'Validation failed',
      details: validateUser.Errors(newUser)
    });
  }
};
