import request from 'supertest';

import testDb from '../../../jest.setup';
import app from '../../app';

describe('Event Controller', () => {
  let token: string;

  beforeEach(async () => {
    await testDb.migrate.rollback();
    await testDb.migrate.latest();

    token = await global.register();
  });

  it('should get a list of events', async () => {
    let response = await request(app)
      .post('/api/v1/calendars')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Calender test name',
        description: 'Calendar test description',
        color: '#1100FF'
      });

    const { calendarId } = response.body.data;

    await request(app)
      .post(`/api/v1/calendars/${calendarId}/events`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Event test title 1',
        description: 'Event test description 1',
        location: 'Tripoli, Libya',
        startTime: '2024-07-01 13:31:33.455853+00',
        endTime: '2024-07-03 13:31:33.455853+00',
        allDay: false
      });

    await request(app)
      .post(`/api/v1/calendars/${calendarId}/events`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Event test title 2',
        description: 'Event test description 2',
        location: 'Tripoli, Libya',
        startTime: '2024-07-04 13:31:33.455853+00',
        endTime: '2024-07-05 13:31:33.455853+00',
        allDay: true
      });

    response = await request(app)
      .get(`/api/v1/calendars/${calendarId}/events`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toHaveProperty('title', 'Event test title 1');
    expect(response.body.data[1]).toHaveProperty('title', 'Event test title 2');
  });

  it('should get an event by id', async () => {
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
      .post(`/api/v1/calendars/${calendarId}/events`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Get event by id title',
        description: 'Get event by id description 1',
        location: 'Tripoli, Libya',
        startTime: '2024-07-01 13:31:33.455853+00',
        endTime: '2024-07-03 13:31:33.455853+00',
        allDay: false
      });

    const { eventId } = response.body.data;

    response = await request(app)
      .get(`/api/v1/calendars/${calendarId}/events/${eventId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toHaveProperty('eventId', eventId);
    expect(response.body.data).toHaveProperty('title', 'Get event by id title');
  });

  it('should create a new event', async () => {
    let response = await request(app)
      .post('/api/v1/calendars')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New calenders event',
        description: 'New calendar event description',
        color: '1100FF'
      });

    const { calendarId } = response.body.data;

    response = await request(app)
      .post(`/api/v1/calendars/${calendarId}/events`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New event title',
        description: 'New event description',
        location: 'Tripoli, Libya',
        startTime: '2024-07-01 13:31:33.455853+00',
        endTime: '2024-07-15 13:31:33.455853+00',
        allDay: true
      });

    const { eventId } = response.body.data;

    expect(response.status).toBe(201);
    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toHaveProperty('eventId', eventId);
    expect(response.body.data).toHaveProperty('title', 'New event title');
    expect(response.body.data.allDay).toBeTruthy();
  });
});
