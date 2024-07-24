import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { TEvent, TEvents, TRequestEvents } from '../types';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  events: TEvents = {
    data: [],
    pagination: {
      currentPage: 0,
      pageSize: 0,
      totalItems: 0,
      totalPages: 0
    }
  };

  event: TEvent = {
    calendarId: '',
    eventId: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    allDay: false
  };

  constructor(private apiService: ApiService) {}

  async onFetchEvents({
    calendarId,
    page,
    pageSize,
    sortBy,
    sortOrder,
    searchBy,
    searchValue,
    filterBy,
    filterValue
  }: TRequestEvents): Promise<any> {
    try {
      const response = await this.apiService.axiosClient.get(
        `/calendars/${calendarId}/events`,
        {
          params: {
            sortBy,
            sortOrder,
            searchBy,
            searchValue,
            filterBy,
            filterValue,
            page: page || 1,
            pageSize: pageSize || 1000
          }
        }
      );
      this.events = response.data;
    } catch (error) {
      throw error;
    }
  }

  async onFetchEvent({
    calendarId,
    eventId
  }: {
    calendarId: string;
    eventId: string;
  }): Promise<any> {
    try {
      const response = await this.apiService.axiosClient.get(
        `/calendars/${calendarId}/events/${eventId}`
      );
      this.event = {
        ...response.data.data,
        startTime: response.data.data.startTime.slice(0, -1),
        endTime: response.data.data.endTime.slice(0, -1)
      };
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
  }: Partial<TEvent>): Promise<any> {
    try {
      await this.apiService.axiosClient.post(
        `/calendars/${calendarId}/events`,
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

  async onUpdateEvent({
    calendarId,
    eventId,
    title,
    description,
    startTime,
    endTime,
    location,
    allDay
  }: TEvent): Promise<any> {
    try {
      await this.apiService.axiosClient.put(
        `/calendars/${calendarId}/events/${eventId}`,
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

  async onDeleteEvent({
    calendarId,
    eventId
  }: {
    calendarId: string;
    eventId: string;
  }): Promise<any> {
    try {
      await this.apiService.axiosClient.delete(
        `/calendars/${calendarId}/events/${eventId}`
      );
    } catch (error) {
      throw error;
    }
  }
}
