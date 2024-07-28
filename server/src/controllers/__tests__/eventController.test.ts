import request from 'supertest';

import testDb from '../../../jest.setup';
import app from '../../app';

describe('Event Controller', () => {
  let token: string;
  let calendarEventId: string;
  let deletedEventId: string;

  beforeEach(async () => {
    await testDb.migrate.rollback();
    await testDb.migrate.latest();

    token = await global.register();
  });

  it('should get list of events', async () => {
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
        allDay: false,
        color: '#1100FF'
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
        allDay: true,
        color: '#1100EE'
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

  it('should get single event by ID', async () => {
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
        allDay: false,
        color: '#1100FF'
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
        allDay: true,
        color: '#1100FF'
      });

    const { eventId } = response.body.data;

    expect(response.status).toBe(201);
    expect(response.body.success).toBeTruthy();
    expect(response.body.data.allDay).toBeTruthy();
    expect(response.body.data).toHaveProperty('eventId', eventId);
    expect(response.body.data).toHaveProperty('color', '#1100FF');
    expect(response.body.data).toHaveProperty('title', 'New event title');
  });

  it('should update event by ID', async () => {
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
      .post(`/api/v1/calendars/${calendarId}/events`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'New event title',
        description: 'New event description',
        location: 'Tripoli, Libya',
        startTime: '2024-07-01 13:31:33.455853+00',
        endTime: '2024-07-15 13:31:33.455853+00',
        allDay: true,
        color: '#1100FF'
      });

    const { eventId } = response.body.data;

    response = await request(app)
      .put(`/api/v1/calendars/${calendarId}/events/${eventId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated event title',
        description: 'Updated event description',
        location: 'Tripoli, Libya',
        startTime: '2024-07-01 13:31:33.455853+00',
        endTime: '2024-07-15 13:31:33.455853+00',
        allDay: false,
        color: '#1100EE'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.message).toBe('Event updated successfully');
    expect(response.body.data).toHaveProperty('calendarId', calendarId);
    expect(response.body.data).toHaveProperty('eventId', eventId);
    expect(response.body.data).toHaveProperty('title', 'Updated event title');
    expect(response.body.data).toHaveProperty('color', '#1100EE');
    expect(response.body.data.allDay).toBeFalsy();
  });

  it('should delete event by ID', async () => {
    let response = await request(app)
      .post('/api/v1/calendars')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'calender name',
        description: 'calendar description',
        color: '#1100FF'
      });

    calendarEventId = response.body.data.calendarId;

    response = await request(app)
      .post(`/api/v1/calendars/${calendarEventId}/events`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Event title to be deleted',
        description: 'Event description to be deleted',
        location: 'Tripoli, Libya',
        startTime: '2024-07-01 13:31:33.455853+00',
        endTime: '2024-07-15 13:31:33.455853+00',
        allDay: true,
        color: '#1100EE'
      });

    deletedEventId = response.body.data.eventId;

    response = await request(app)
      .delete(`/api/v1/calendars/${calendarEventId}/events/${deletedEventId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBeTruthy();
    expect(response.body.data).toBe(deletedEventId);
    expect(response.body.message).toBe('Event deleted successfully');
  });

  it('should return 404 if the eventId is not found', async () => {
    const response = await request(app)
      .get(`/api/v1/calendars/${calendarEventId}/events/${deletedEventId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Event not found');
  });

  it('should return 400 if the eventId is not valid', async () => {
    const response = await request(app)
      .get(`/api/v1/calendars/${calendarEventId}/events/fake-event-id`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Event ID is not valid');
  });
});
