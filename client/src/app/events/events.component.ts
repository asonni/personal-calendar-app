import { Router } from '@angular/router';
import { Input, Component, OnInit, Inject } from '@angular/core';
import {
  TuiTableModule,
  TuiTablePaginationModule
} from '@taiga-ui/addon-table';
import { EventService } from '../services/event.service';
import { TuiAlertService, TuiLoaderModule } from '@taiga-ui/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { TEvents, TKey } from '../types';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    CommonModule,
    TuiTableModule,
    TuiLoaderModule,
    TuiTablePaginationModule
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
  providers: [DatePipe]
})
export class EventsComponent implements OnInit {
  events: TEvents | undefined;
  eventsLoading: boolean = false;

  page: number = 1;
  pageSize: number = 10;
  sortOrder: 'asc' | 'desc' | null = 'asc';
  sortBy: TKey = 'title';
  searchBy: TKey = null;
  searchValue: string = '';
  filterBy: TKey = null;
  filterValue: string = '';

  columns = [
    'title',
    'description',
    'allDay',
    'startTime',
    'endTime',
    'location'
  ];

  readonly sorter$ = new BehaviorSubject<TKey>('title');

  constructor(
    private router: Router,
    private datePipe: DatePipe,
    private eventService: EventService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService
  ) {}

  @Input() calendarId!: string;

  ngOnInit(): void {
    this.onFetchEvents();
  }

  onSort(column: TKey): void {
    this.sortBy = column;
    switch (this.sortOrder) {
      case 'asc':
        this.sortOrder = 'desc';
        break;
      case 'desc':
        this.sortOrder = 'asc';
        break;
      default:
        this.sortOrder = 'asc';
        break;
    }
    this.onFetchEvents();
  }

  onPage(page: number): void {
    this.page = page + 1;
    this.onFetchEvents();
  }

  async onFetchEvents(): Promise<any> {
    if (!this.calendarId) return;
    this.eventsLoading = true;
    try {
      await this.eventService.onFetchEvents({
        calendarId: this.calendarId,
        page: this.page,
        pageSize: this.pageSize,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
        filterBy: this.filterBy,
        filterValue: this.filterValue
      });
      this.events = {
        data: this.eventService.events.data.map((event: any) => ({
          ...event,
          startDate: this.datePipe.transform(event.startTime, 'YYYY-MM-dd'),
          endDate: this.datePipe.transform(event.endTime, 'YYYY-MM-dd'),
          startDay: this.datePipe.transform(event.startTime, 'dd'),
          endDay: this.datePipe.transform(event.endTime, 'dd')
        })),
        pagination: this.eventService.events.pagination
      };
    } catch (error: any) {
      this.alerts
        .open('', { label: error?.message, status: 'error' })
        .subscribe();
    } finally {
      this.eventsLoading = false;
    }
  }
}
