import { config } from 'dotenv';
import request from 'supertest';

import testDb from '../../../jest.setup';
import app from '../../app';

config({ path: '.env.local' });

describe('Auth Controller', () => {
  beforeAll(async () => {
    await testDb.migrate.rollback();
    await testDb.migrate.latest();
  });

  afterAll(async () => {
    await testDb.migrate.rollback();
    await testDb.destroy();
  });

  it('should register a new user', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      email: 'test1@example.com',
      password: 'password123'
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBeTruthy();
    expect(response.body).toHaveProperty('token');
  });

  it('should login an existing user', async () => {
    await request(app).post('/api/v1/auth/register').send({
      email: 'login@example.com',
      password: 'password123'
    });

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'login@example.com',
      password: 'password123'
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body).toHaveProperty('token');
  });

  it('should fail to log in with incorrect password', async () => {
    await request(app).post('/api/v1/auth/register').send({
      email: 'wrongpass@example.com',
      password: 'password123'
    });

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'wrongpass@example.com',
      password: 'wrongpassword'
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBeFalsy();
    expect(response.body.message).toBe('Invalid credentials');
  });
});
