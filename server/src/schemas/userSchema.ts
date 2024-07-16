import { Type } from '@sinclair/typebox';

export const UserSchema = Type.Object({
  userId: Type.Optional(Type.Integer()),
  email: Type.String({ format: 'email' }),
  firstName: Type.Optional(Type.String()),
  lastName: Type.Optional(Type.String()),
  password: Type.String(),
  passwordChangedAt: Type.String({ format: 'date-time' }),
  resetPasswordToken: Type.Optional(Type.String()),
  resetPasswordExpires: Type.Optional(Type.String({ format: 'date-time' })),
  createdAt: Type.Optional(Type.String({ format: 'date-time' })),
  updatedAt: Type.Optional(Type.String({ format: 'date-time' }))
});
