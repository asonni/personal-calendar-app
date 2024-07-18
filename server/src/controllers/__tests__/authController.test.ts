import { config } from 'dotenv';
import request from 'supertest';

import app from '../../app';

config({ path: '.env.local' });

describe('Auth Controller', () => {
  it('should register a new user', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      firstName: 'test',
      lastName: '1',
      email: 'test1@example.com',
      password: 'password123'
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBeTruthy();
    expect(response.body).toHaveProperty('token');
  });

  it('should login an existing user', async () => {
    await request(app).post('/api/v1/auth/register').send({
      firstName: 'log',
      lastName: 'in',
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

  it('should get current logged in user via token', async () => {
    // @ts-ignore
    const token = await global.register();

    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toHaveProperty('email', 'john.doe@example.com');
  });

  it('should logout an existing user', async () => {
    const response = await request(app).get('/api/v1/auth/logout');

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body).toHaveProperty('token');
    expect(response.body.token).toBeNull();
  });

  it('should fail to login with invalid credentials', async () => {
    await request(app).post('/api/v1/auth/register').send({
      firstName: 'wrong',
      lastName: 'pass',
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
