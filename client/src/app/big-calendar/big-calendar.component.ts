import dayjs from 'dayjs';
import { CommonModule, DatePipe } from '@angular/common';
import {
  OnInit,
  Inject,
  Injector,
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import {
  TuiDataListWrapperModule,
  tuiItemsHandlersProvider,
  TuiSelectModule
} from '@taiga-ui/kit';

import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { UtilsService } from '../utils/utils.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  TuiAlertService,
  TuiDataListModule,
  TuiDialogService
} from '@taiga-ui/core';
import { CalendarService } from '../services/calendar.service';
import { EventService } from '../services/event.service';
import { NewEventComponent } from '../events/new-event/new-event.component';

type TCalendar = {
  calendarId: string;
  name: string;
};

type TEvent = {
  eventId: string;
  calendarId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  startDate: string;
  endDate: string;
  startDay: number;
  endDay: number;
};

@Component({
  selector: 'app-big-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiSelectModule,
    TuiDataListModule,
    TuiDataListWrapperModule
  ],
  templateUrl: './big-calendar.component.html',
  styleUrl: './big-calendar.component.css',
  providers: [
    DatePipe,
    tuiItemsHandlersProvider({
      stringify: (item: TCalendar) => `${item.name}`
    })
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BigCalendarComponent implements OnInit {
  currentDay: any;
  currentMonth: any;
  monthIndex = dayjs().month();

  selectedCalendar: TCalendar | null = null;

  calendars: TCalendar[] = [];
  calendarsLoading: boolean = false;

  events: TEvent[] = [];
  eventsLoading: boolean = false;

  constructor(
    private router: Router,
    private datePipe: DatePipe,
    private utils: UtilsService,
    private authService: AuthService,
    private eventService: EventService,
    private calendarService: CalendarService,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService
  ) {
    this.handleCurrentMonth();
  }

  async ngOnInit() {
    await this.onFetchCalendars();
    if (this.selectedCalendar?.calendarId) {
      this.onFetchEvents(this.selectedCalendar.calendarId);
    }
  }

  showNewEventDialog(): void {
    this.dialogs
      .open(new PolymorpheusComponent(NewEventComponent, this.injector))
      .subscribe({
        next: data => {
          if (this.selectedCalendar?.calendarId && JSON.stringify(data)) {
            this.onFetchEvents(this.selectedCalendar.calendarId);
          }
        }
      });
  }

  onChangeSelectedCalendar(newSelectedCalendar: TCalendar): void {
    this.onFetchEvents(newSelectedCalendar.calendarId);
  }

  handleCurrentMonth(): void {
    this.currentMonth = this.utils.getMonth(this.monthIndex);
    this.currentDay = dayjs(new Date(dayjs().year(), this.monthIndex)).format(
      'MMMM YYYY'
    );
  }

  handlePrevMonth(): void {
    this.monthIndex -= 1;
    this.handleCurrentMonth();
  }

  handleNextMonth(): void {
    this.monthIndex += 1;
    this.handleCurrentMonth();
  }

  handleReset(): void {
    this.monthIndex = dayjs().month();
    this.handleCurrentMonth();
  }

  getCurrentDayClass(day: any): boolean {
    return day.format('DD-MM-YY') === dayjs().format('DD-MM-YY');
  }

  isDateWithinPeriod(currentDay: string): boolean {
    return currentDay === this.currentDay;
  }

  isTimeWithinSpecificDay(
    startTime: string,
    endTime: string,
    specificDate: string
  ): boolean {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const specific = new Date(specificDate);

    return start <= specific && end >= specific;
  }

  async onLogout(): Promise<any> {
    try {
      await this.authService.logout();
      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/sign-in']);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async onFetchCalendars(): Promise<any> {
    this.calendarsLoading = true;
    try {
      await this.calendarService.onFetchCalendars();
      this.calendars = this.calendarService.calendars;
      if (this.calendars.length) {
        this.selectedCalendar = this.calendars[0];
      }
    } catch (error: any) {
      this.alerts
        .open('', { label: error?.message, status: 'error' })
        .subscribe();
    } finally {
      this.calendarsLoading = false;
    }
  }

  async onFetchEvents(calendarId: string): Promise<any> {
    this.eventsLoading = true;
    try {
      await this.eventService.onFetchEvents(calendarId);
      this.events = this.eventService.events.map((event: any) => ({
        ...event,
        startDate: this.datePipe.transform(event.startTime, 'YYYY-MM-dd'),
        endDate: this.datePipe.transform(event.endTime, 'YYYY-MM-dd'),
        startDay: this.datePipe.transform(event.startTime, 'dd'),
        endDay: this.datePipe.transform(event.endTime, 'dd')
      }));
    } catch (error: any) {
      this.alerts
        .open('', { label: error?.message, status: 'error' })
        .subscribe();
    } finally {
      this.eventsLoading = false;
    }
  }
}
