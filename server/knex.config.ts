import { config } from 'dotenv';

config({ path: '.env.local' });

const configuration: { [key: string]: any } = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};

export default configuration;
