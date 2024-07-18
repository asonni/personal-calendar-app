import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import validator from 'validator';

import db from '../db/knex';
import asyncHandler from '../middlewares/async';
import { TUserSchema } from '../schemas/userSchema';
import ErrorResponse from '../utils/errorResponse';
import sendEmail from '../utils/sendEmail';
import { TAuthenticatedRequest } from '../utils/types';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRE = process.env.JWT_EXPIRE as string;
const RESET_PASSWORD_EXPIRATION = parseInt(
  process.env.RESET_PASSWORD_EXPIRATION!
);
const JWT_COOKIE_EXPIRE = parseInt(process.env.JWT_COOKIE_EXPIRE!);

const sendTokenResponse = (
  user: TUserSchema,
  statusCode: number,
  req: Request,
  res: Response
) => {
  const token = jwt.sign(
    {
      id: user.userId
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

export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie('token');

    return res.status(200).json({
      success: true,
      token: null
    });
  }
);

export const getMe = asyncHandler(
  async (req: TAuthenticatedRequest, res: Response, next: NextFunction) => {
    const [user]: TUserSchema[] = await db('Users')
      .where({ userId: req.user?.userId })
      .select(['firstName', 'lastName', 'email']);

    return res.status(200).json({
      success: true,
      data: user
    });
  }
);

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = req.body;

    const hashedPassword = await bcrypt.hash(newUser.password, 10);

    const [user]: TUserSchema[] = await db('Users')
      .insert({
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: hashedPassword
      })
      .returning(['userId', 'email', 'firstName', 'lastName']);

    sendTokenResponse(user, 201, req, res);
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || validator.isEmpty(email)) {
      return next(new ErrorResponse('Email field is required', 400));
    }

    if (!validator.isEmail(email)) {
      return next(new ErrorResponse('You must provide a valid email', 400));
    }

    if (!password || validator.isEmpty(password)) {
      return next(new ErrorResponse('Password field is required', 400));
    }

    const user = await db('Users').where({ email }).first();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, req, res);
  }
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email || validator.isEmpty(email)) {
      return next(new ErrorResponse('Email field is required', 400));
    }

    if (!validator.isEmail(email)) {
      return next(new ErrorResponse('You must provide a valid email', 400));
    }

    const user = await db('Users').where({ email }).first();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    const token = crypto.createHash('sha256').update(resetToken).digest('hex');

    const expiresAt = Date.now() + RESET_PASSWORD_EXPIRATION * 60 * 1000;

    await db('Users')
      .update({
        resetPasswordToken: token,
        resetPasswordExpires: new Date(expiresAt),
        updatedAt: new Date()
      })
      .where({ userId: user.userId });

    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset',
        message
      });

      res
        .status(200)
        .json({ success: true, message: 'Password reset email sent' });
    } catch {
      await db('Users')
        .update({
          resetPasswordToken: null,
          resetPasswordExpires: null,
          updatedAt: new Date()
        })
        .where({ userId: user.userId });

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { newPassword } = req.body;
    const { resettoken } = req.params;

    if (!newPassword || !validator.isEmpty(newPassword)) {
      return next(new ErrorResponse('New password field is required', 400));
    }

    if (!resettoken || !validator.isEmpty(resettoken)) {
      return next(new ErrorResponse('Reset token was not provided', 400));
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resettoken)
      .digest('hex');

    const [user]: TUserSchema[] = await db('Users')
      .where({ resetPasswordToken })
      .select(['userId', 'resetPasswordExpires']);

    if (!user || new Date(user.resetPasswordExpires!).getTime() < Date.now()) {
      return next(new ErrorResponse('Invalid token or has expired', 400));
    }

    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

    await db('Users')
      .update({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        passwordChangedAt: new Date(),
        updatedAt: new Date()
      })
      .where({ userId: user.userId });

    return sendTokenResponse(user, 200, req, res);
  }
);
