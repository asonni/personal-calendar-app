import cookieParser from 'cookie-parser';
import cors, { CorsOptions } from 'cors';
import express, { Express, Request, Response } from 'express';
import morgan from 'morgan';
import path from 'path';

import api from './routes/api';

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

app.use(cors(corsOptions));
app.use(morgan('combined'));

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/v1', api);

app.get('/*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

export default app;
