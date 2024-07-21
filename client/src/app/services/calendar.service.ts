import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

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
}
