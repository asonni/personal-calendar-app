import knex from 'knex';
import { Model } from 'objection';

import config from './knexfile';

// Initialize the test database connection
const testDb = knex(config.test);

// Set up Objection.js to use the test database
Model.knex(testDb);

export default testDb;
