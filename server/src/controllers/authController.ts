import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { TUserSchema } from 'schemas/userSchema';

import db from '../db/knex';
import sendEmail from '../utils/sendEmail';

dotenv.config({ path: '.env.local' });

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRE = process.env.JWT_EXPIRE as string;
const RESET_PASSWORD_EXPIRATION = process.env
  .RESET_PASSWORD_EXPIRATION as string;

const JWT_COOKIE_EXPIRE: any = process.env.JWT_COOKIE_EXPIRE;

const sendTokenResponse = (
  user: TUserSchema,
  statusCode: number,
  req: Request,
  res: Response
) => {
  const token = jwt.sign(
    {
      id: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRE
    }
  );

  const options = {
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  };

  return res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token
  });
};

export const register = async (req: Request, res: Response) => {
  const newUser = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newUser.password, 10);

    const user: TUserSchema[] = await db('Users')
      .returning(['userId', 'email', 'firstName', 'lastName'])
      .insert({
        email: newUser.email,
        password: hashedPassword
      });

    sendTokenResponse(user[0], 201, req, res);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await db('Users').where({ email }).first();
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.userId }, JWT_SECRET, {
      expiresIn: JWT_EXPIRE
    });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await db('Users').where({ email }).first();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(
      Date.now() + Number(RESET_PASSWORD_EXPIRATION) * 60 * 60 * 1000
    );

    await db('PasswordResets').insert({ email, token, expiresAt });

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    await sendEmail({
      email: email,
      subject: 'Password Reset',
      message: `Click the following link to reset your password: ${resetLink}`
    });

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    const resetRequest = await db('PasswordResets').where({ token }).first();
    if (!resetRequest || new Date(resetRequest.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db('Users')
      .where({ email: resetRequest.email })
      .update({ password: hashedPassword });

    await db('PasswordResets').where({ token }).delete();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
};
