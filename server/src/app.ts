import colors from 'colors';
import cookieParser from 'cookie-parser';
import cors, { CorsOptions } from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import path from 'path';

import errorHandler from './middlewares/error';
import api from './routes/apiRoutes';
import ErrorResponse from './utils/errorResponse';

process.on('uncaughtException', (err: Error) => {
  // eslint-disable-next-line no-console
  console.log('UNCAUGHT EXCEPTION! Shutting down...'.red.bold);
  // eslint-disable-next-line no-console
  console.log(err.name, err.message);
  // exit process
  process.exit(1);
});

const app: Express = express();

type TOrigin = boolean | string | RegExp | Array<boolean | string | RegExp>;

const whitelist: string[] = ['http://localhost:8080'];

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, origin?: TOrigin) => void
  ) => {
    if (origin === undefined || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

colors.enable();

app.use(cors(corsOptions));
app.use(morgan('combined'));

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/v1', api);

app.use(errorHandler);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new ErrorResponse(`Can't find ${req.originalUrl} on this server!`, 404));
});

// app.get('/*', (req: Request, res: Response) => {
//   res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
// });

app.use(errorHandler);

export default app;
