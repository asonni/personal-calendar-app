import { TypeCompiler } from '@sinclair/typebox/compiler';
import { Request, Response } from 'express';

import db from '../db/knex';
import { UserSchema } from '../schemas/userSchema';

const validateUser = TypeCompiler.Compile(UserSchema);

export const createUser = async (req: Request, res: Response) => {
  const newUser = req.body;

  if (validateUser.Check(newUser)) {
    try {
      await db('Users').insert(newUser);
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
