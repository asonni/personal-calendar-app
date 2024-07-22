import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

type TPayloadEvent = {
  calendarId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  allDay: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class EventService {
  events = [];

  constructor(private apiService: ApiService) {}

  async onFetchEvents(calendarId: string): Promise<any> {
    try {
      const response = await this.apiService.axiosClient.get(
        `/calendars/${calendarId}/events`
      );
      this.events = response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async onCreateEvent({
    calendarId,
    title,
    description,
    startTime,
    endTime,
    location,
    allDay
  }: TPayloadEvent): Promise<any> {
    try {
      await this.apiService.axiosClient.post(
        `/calendars/373beac6-026b-4879-b6aa-462867af56ba/events`,
        {
          title,
          description,
          startTime,
          endTime,
          location,
          allDay
        }
      );
    } catch (error) {
      throw error;
    }
  }
}
