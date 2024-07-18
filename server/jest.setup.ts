import knex from 'knex';
import { Model } from 'objection';
import request from 'supertest';

import config from './knexfile';
import app from './src/app';

// Initialize the test database connection
const testDb = knex(config.test);

// Set up Objection.js to use the test database
Model.knex(testDb);

declare global {
  var register: () => Promise<string>;
}

beforeAll(async () => {
  await testDb.migrate.rollback();
  await testDb.migrate.latest();
});

beforeEach(async () => {
  await testDb.migrate.rollback();
  await testDb.migrate.latest();
});

afterAll(async () => {
  await testDb.migrate.rollback();
  await testDb.destroy();
});

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
