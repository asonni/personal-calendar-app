import { Injectable } from '@angular/core';

import { ApiService } from '../api.service';
import { TCalendar } from '../types';

type TPayloadCalendar = {
  name: string;
  description: string;
  color: string;
};

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  calendars = [];
  calendar: TCalendar = {
    calendarId: '',
    name: '',
    description: '',
    color: ''
  };

  constructor(private apiService: ApiService) {}

  async onFetchCalendars(): Promise<any> {
    try {
      const response = await this.apiService.axiosClient.get('/calendars');
      this.calendars = response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async onFetchCalendar({ calendarId }: { calendarId: string }): Promise<any> {
    try {
      const response = await this.apiService.axiosClient.get(
        `/calendars/${calendarId}`
      );
      this.calendar = response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async onCreateCalendar({
    name,
    description,
    color
  }: TPayloadCalendar): Promise<any> {
    try {
      await this.apiService.axiosClient.post('/calendars', {
        name,
        description,
        color
      });
    } catch (error) {
      throw error;
    }
  }

  async onUpdateCalendar({
    calendarId,
    name,
    description,
    color
  }: TCalendar): Promise<any> {
    try {
      await this.apiService.axiosClient.put(`/calendars/${calendarId}`, {
        name,
        description,
        color
      });
    } catch (error) {
      throw error;
    }
  }

  async onDeleteCalendar({ calendarId }: { calendarId: string }): Promise<any> {
    try {
      await this.apiService.axiosClient.delete(`/calendars/${calendarId}`);
    } catch (error) {
      throw error;
    }
  }
}
