import express from 'express';

// import authRoutes from './authRoutes';
import calendarRoutes from './calendarRoutes';
import userRoutes from './userRoutes';

const api = express.Router();

api.use('/users', userRoutes);
api.use('/calendars', calendarRoutes);
// api.use('/auth', authRoutes);

export default api;
