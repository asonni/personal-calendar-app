import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { Input, Component, OnInit, Inject, Injector } from '@angular/core';
import {
  TuiAlertService,
  TuiButtonModule,
  TuiDialogService,
  TuiLoaderModule
} from '@taiga-ui/core';
import {
  TuiTableModule,
  TuiTablePaginationModule
} from '@taiga-ui/addon-table';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';

import type { TEvents, TKey } from '../types';
import { DIALOG_DATA } from '../dialog-tokens';
import { EventService } from '../services/event.service';
import { EditorEventComponent } from './editor-event/editor-event.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  TuiDataListWrapperModule,
  TuiInputModule,
  TuiSelectModule
} from '@taiga-ui/kit';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    CommonModule,
    TuiSelectModule,
    TuiInputModule,
    TuiTableModule,
    TuiLoaderModule,
    TuiButtonModule,
    ReactiveFormsModule,
    TuiTablePaginationModule,
    TuiDataListWrapperModule
  ],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
  providers: [DatePipe]
})
export class EventsComponent implements OnInit {
  findForm: FormGroup;
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

  searchByItems = ['Title', 'Description', 'Location'];
  filterByItems = ['Title', 'Description', 'Location', 'All day'];

  columns = [
    'title',
    'description',
    'allDay',
    'startTime',
    'endTime',
    'location'
  ];

  readonly sorter$ = new BehaviorSubject<TKey>('startTime');
  Injector: Injector | null | undefined;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private eventService: EventService,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService
  ) {
    this.findForm = this.fb.group({
      searchBy: [null],
      searchValue: [null],
      filterBy: [null],
      filterValue: [null]
    });
  }

  @Input() calendarId!: string;

  ngOnInit(): void {
    this.onFetchEvents();
  }

  onFindSubmit() {
    const { searchBy, searchValue, filterBy, filterValue } =
      this.findForm.value;
    this.searchBy = searchBy?.toLowerCase() || null;
    this.searchValue = searchValue || '';
    this.filterBy = filterBy?.toLowerCase() || null;
    this.filterValue = filterValue || '';
    if (filterBy === 'All day') {
      this.filterBy = 'allDay';
      this.filterValue = JSON.stringify(filterValue === 'Yes');
    }
    this.onFetchEvents();
  }

  onFindReset() {
    this.findForm.reset();
    this.searchBy = null;
    this.searchValue = '';
    this.filterBy = null;
    this.filterValue = '';
    this.onFetchEvents();
  }

  onClickMyCalendars() {
    this.router.navigate(['/calendar']);
  }

  showEditorEventDialog(): void {
    if (!this.calendarId) return;
    const dialogInjector = Injector.create({
      providers: [
        {
          provide: DIALOG_DATA,
          useValue: { calendarId: this.calendarId }
        }
      ],
      parent: this.injector
    });

    this.dialogs
      .open(new PolymorpheusComponent(EditorEventComponent, dialogInjector))
      .subscribe({
        next: data => {
          if (JSON.stringify(data)) {
            this.onFetchEvents();
          }
        }
      });
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
        searchBy: this.searchBy,
        searchValue: this.searchValue,
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
