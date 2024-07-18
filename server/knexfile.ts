import { config } from 'dotenv';

config({ path: '.env.local' });

const configuration: { [key: string]: any } = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL_DEVELOPMENT,
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  test: {
    client: 'pg',
    connection: process.env.DATABASE_URL_TEST,
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL_PRODUCTION,
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};

export default configuration;
