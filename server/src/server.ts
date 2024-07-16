import { config } from 'dotenv';
import http from 'http';

import app from './app';

config({ path: '.env.local' });

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.info(`Listening on port ${PORT}`);
});
