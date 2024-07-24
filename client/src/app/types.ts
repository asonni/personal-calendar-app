export type TKey =
  | 'title'
  | 'description'
  | 'allDay'
  | 'startTime'
  | 'endTime'
  | 'location'
  | null;

export type TCalendar = {
  calendarId: string;
  name: string;
  description: string;
  color: string;
};

export type TRequestEvents = {
  calendarId: string;
  page?: number;
  pageSize?: number;
  sortBy?: TKey;
  sortOrder?: 'asc' | 'desc' | null;
  searchBy?: TKey;
  searchValue?: string;
  filterBy?: TKey;
  filterValue?: string;
};

export type TEvent = {
  calendarId: string;
  eventId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  allDay: boolean;
};

export type TEvents = {
  data: TEvent[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

export type TCustomEvent = TEvent & {
  startDate: string;
  endDate: string;
  startDay: number;
  endDay: number;
};
