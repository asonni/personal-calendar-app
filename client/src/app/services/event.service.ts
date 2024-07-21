import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

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
}
