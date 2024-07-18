import request from 'supertest';

import testDb from '../../../jest.setup';
import app from '../../app';

describe('Calendar Controller', () => {
  let token: string;

  beforeEach(async () => {
    await testDb.migrate.rollback();
    await testDb.migrate.latest();

    token = await global.register();
  });

  it('should get a list of calenders', async () => {
    await request(app)
      .post('/api/v1/calendars')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Calender name 1',
        description: 'Calendar description 1',
        color: '1100FF'
      });

    await request(app)
      .post('/api/v1/calendars')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Calender name 2',
        description: 'Calendar description 2',
        color: '1100FF'
      });

    const response = await request(app)
      .get('/api/v1/calendars')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toHaveProperty('name', 'Calender name 1');
    expect(response.body.data[1]).toHaveProperty('name', 'Calender name 2');
  });

  it('should get a calender by id', async () => {
    let response = await request(app)
      .post('/api/v1/calendars')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Calender name 1',
        description: 'Calendar description 1',
        color: '1100FF'
      });

    const { calendarId } = response.body.data;

    response = await request(app)
      .get(`/api/v1/calendars/${calendarId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toHaveProperty('calendarId', calendarId);
    expect(response.body.data).toHaveProperty('name', 'Calender name 1');
  });

  it('should create a new calender', async () => {
    let response = await request(app)
      .post('/api/v1/calendars')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New calender name',
        description: 'New calendar description',
        color: '1100FF'
      });

    const { calendarId } = response.body.data;

    expect(response.status).toBe(201);
    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toHaveProperty('calendarId', calendarId);
    expect(response.body.data).toHaveProperty('name', 'New calender name');
  });

  it('should update calender by id', async () => {
    let response = await request(app)
      .post('/api/v1/calendars')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'calender name',
        description: 'calendar description',
        color: '#1100FF'
      });

    const { calendarId } = response.body.data;

    response = await request(app)
      .put(`/api/v1/calendars/${calendarId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated calender name',
        description: 'Updated calendar description',
        color: '#1100EE'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Calendar updated successfully');
    expect(response.body.data).toHaveProperty('calendarId', calendarId);
    expect(response.body.data).toHaveProperty('name', 'Updated calender name');
    expect(response.body.data).toHaveProperty('color', '#1100EE');
  });

  it('should return 404 if calender not found', async () => {
    const response = await request(app)
      .get(`/api/v1/calendars/face-calendar-id`) // Non-existent calendar ID
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Calendar not found');
  });
});
