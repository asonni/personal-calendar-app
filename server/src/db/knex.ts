import knex from 'knex';

import config from '../../knex.config';

const environment = process.env.NODE_ENV || 'development';
const knexConfig = config[environment];

if (!knexConfig) {
  throw new Error(
    `Could not find knex configuration for environment: ${environment}`
  );
}

export default knex(knexConfig);
