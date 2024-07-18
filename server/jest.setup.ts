import knex from 'knex';
import { Model } from 'objection';
import request from 'supertest';

import configuration from './knexfile';
import app from './src/app';

// Initialize the test database connection
const testDb = knex(configuration.test);

// Set up Objection.js to use the test database
Model.knex(testDb);

declare global {
  var register: () => Promise<string>;
}

beforeAll(async () => {
  // Roll back any existing migrations to ensure a clean state
  await testDb.migrate.rollback();
  // Run the latest migrations to set up the database schema
  await testDb.migrate.latest();
});

afterAll(async () => {
  // Roll back all migrations to clean up the database
  await testDb.migrate.rollback();
  // Close the database connection
  await testDb.destroy();
});

// Add the register function to the global object
global.register = async () => {
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    })
    .expect(201);

  // Return the token from the response
  return response.body.token;
};

export default testDb;
