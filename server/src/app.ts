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

const whitelist: string[] = ['http://localhost:4200', 'http://localhost:8080'];

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
  },
  methods: 'GET,POST,PUT,DELETE',
  credentials: true, // Allow credentials
  optionsSuccessStatus: 204
};

colors.enable();

app.use(cors(corsOptions));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('combined'));
}

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1', api);

app.use(errorHandler);

if (process.env.NODE_ENV === 'development') {
  app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(
      new ErrorResponse(`Can't find ${req.originalUrl} on this server!`, 404)
    );
  });
}

if (process.env.NODE_ENV === 'production') {
  // Express will serve up production assets
  // like our main.js file, or main.css file!
  app.use(
    express.static(path.join(__dirname, '..', '..', 'public', 'browser'))
  );
  // Express will serve up the index.html file
  // if it doesn't recognize the route
  app.get('/*', (req: Request, res: Response) => {
    res.sendFile(
      path.join(__dirname, '..', '..', 'public', 'browser', 'index.html')
    );
  });
}

app.use(errorHandler);

export default app;
