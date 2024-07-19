import { config } from 'dotenv';
import http from 'http';

import app from './app';

config({ path: '.env.local' });

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(
    `Server running ${process.env.NODE_ENV} mode in on port ${PORT}`.yellow.bold
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  // eslint-disable-next-line no-console
  console.log('UNHANDLED REJECTION! Shutting down...'.red.bold);
  // eslint-disable-next-line no-console
  console.log(err.name, err.message);
  // Close server & exit process
  server.close(() => process.exit(1));
});
