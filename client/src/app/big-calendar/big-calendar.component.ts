import dayjs from 'dayjs';
import { TuiDay } from '@taiga-ui/cdk';
import { Router } from '@angular/router';
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
  TuiSelectModule,
  TuiAccordionModule,
  TuiDataListWrapperModule,
  tuiItemsHandlersProvider,
  TuiRadioLabeledModule
} from '@taiga-ui/kit';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  TuiAlertService,
  TuiButtonModule,
  TuiCalendarModule,
  TuiDataListModule,
  TuiDialogService
} from '@taiga-ui/core';

import { DIALOG_DATA } from '../dialog-tokens';
import { AuthService } from '../auth/auth.service';
import { UtilsService } from '../utils/utils.service';
import { EventService } from '../services/event.service';
import { CalendarService } from '../services/calendar.service';
import { NewEventComponent } from '../events/new-event/new-event.component';
import { NewCalendarComponent } from './new-calendar/new-calendar.component';

type TCalendar = {
  calendarId: string;
  name: string;
  description: string;
  color: string;
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
    FormsModule,
    CommonModule,
    TuiSelectModule,
    TuiButtonModule,
    TuiDataListModule,
    TuiCalendarModule,
    TuiAccordionModule,
    ReactiveFormsModule,
    TuiRadioLabeledModule,
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
  miniCalendarValue: TuiDay | null = null;

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

  onClickMiniCalender(day: TuiDay): void {
    this.miniCalendarValue = day;
    this.monthIndex = day.month;
    this.handleCurrentMonth();
  }

  showNewCalendarDialog(): void {
    this.dialogs
      .open(new PolymorpheusComponent(NewCalendarComponent, this.injector))
      .subscribe({
        next: data => {
          if (JSON.stringify(data)) {
            this.onFetchCalendars();
          }
        }
      });
  }

  showNewEventDialog(): void {
    if (!this.selectedCalendar?.calendarId) return;
    const dialogInjector = Injector.create({
      providers: [
        {
          provide: DIALOG_DATA,
          useValue: { calendarId: this.selectedCalendar.calendarId }
        }
      ],
      parent: this.injector
    });

    this.dialogs
      .open(new PolymorpheusComponent(NewEventComponent, dialogInjector))
      .subscribe({
        next: data => {
          if (JSON.stringify(data)) {
            this.ngOnInit();
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
    this.miniCalendarValue = new TuiDay(
      dayjs().year(),
      dayjs().month(),
      dayjs().date()
    );
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
