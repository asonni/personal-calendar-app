import { Injectable } from '@angular/core';

import { ApiService } from '../api.service';

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

  constructor(private apiService: ApiService) {}

  async onFetchCalendars(): Promise<any> {
    try {
      const response = await this.apiService.axiosClient.get('/calendars');
      this.calendars = response.data.data;
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
}
