import dayjs from 'dayjs';
import { TuiDay } from '@taiga-ui/cdk';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { OnInit, Inject, Injector, Component } from '@angular/core';
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
  TuiDialogService,
  TuiLoaderModule
} from '@taiga-ui/core';

import { DIALOG_DATA } from '../dialog-tokens';
import { AuthService } from '../auth/auth.service';
import { UtilsService } from '../utils/utils.service';
import type { TCalendar, TCustomEvent } from '../types';
import { EventService } from '../services/event.service';
import { CalendarService } from '../services/calendar.service';
import { EditorEventComponent } from '../events/editor-event/editor-event.component';
import { NewCalendarComponent } from './new-calendar/new-calendar.component';

@Component({
  selector: 'app-big-calendar',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    CommonModule,
    TuiSelectModule,
    TuiButtonModule,
    TuiDataListModule,
    TuiCalendarModule,
    TuiAccordionModule,
    ReactiveFormsModule,
    TuiRadioLabeledModule,
    TuiDataListWrapperModule,
    TuiLoaderModule
  ],
  templateUrl: './big-calendar.component.html',
  styleUrl: './big-calendar.component.css',
  providers: [
    DatePipe,
    tuiItemsHandlersProvider({
      stringify: (item: TCalendar) => `${item.name}`
    })
  ]
})
export class BigCalendarComponent implements OnInit {
  currentDay: any;
  currentMonth: any;
  monthIndex = dayjs().month();
  miniCalendarValue: TuiDay | null = null;

  selectedCalendar: TCalendar | null = null;
  selectedEventId: string = '';

  calendars: TCalendar[] = [];
  calendarsLoading: boolean = false;

  events: TCustomEvent[] = [];
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

  onClickSpecificEvent(event: TCustomEvent) {
    this.selectedEventId = event.eventId;
    this.showEditorEventDialog();
  }

  navigateToEvents() {
    const calendarId = this.selectedCalendar?.calendarId;
    if (!calendarId) return;
    this.router.navigate([`/calendar/${calendarId}/events`]);
  }

  showNewCalendarDialog(): void {
    this.dialogs
      .open(new PolymorpheusComponent(NewCalendarComponent, this.injector), {
        dismissible: !!this.calendars.length
      })
      .subscribe({
        next: data => {
          if (JSON.stringify(data)) {
            this.onFetchCalendars();
          }
        }
      });
  }

  showEditorEventDialog(): void {
    if (!this.selectedCalendar?.calendarId) return;
    const dialogInjector = Injector.create({
      providers: [
        {
          provide: DIALOG_DATA,
          useValue: {
            eventId: this.selectedEventId,
            miniCalendarValue: this.miniCalendarValue,
            calendarId: this.selectedCalendar.calendarId
          }
        }
      ],
      parent: this.injector
    });

    this.dialogs
      .open(new PolymorpheusComponent(EditorEventComponent, dialogInjector))
      .subscribe({
        next: data => {
          if (JSON.stringify(data)) {
            this.ngOnInit();
          }
        },
        complete: () => {
          this.selectedEventId = '';
          this.miniCalendarValue = null;
        }
      });
  }

  onChangeSelectedCalendar(newSelectedCalendar: TCalendar): void {
    this.onFetchEvents(newSelectedCalendar.calendarId);
  }

  onClickMiniCalender(day: TuiDay): void {
    this.miniCalendarValue = day;
    this.monthIndex = day.month;
    this.handleCurrentMonth();
    this.showEditorEventDialog();
  }

  handleChangeMiniCalendar(monthIndex: number): void {
    this.miniCalendarValue = new TuiDay(
      dayjs(new Date(dayjs().year(), monthIndex)).year(),
      dayjs(new Date(dayjs().year(), monthIndex)).month(),
      dayjs().date()
    );
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
    this.handleChangeMiniCalendar(this.monthIndex);
  }

  handleNextMonth(): void {
    this.monthIndex += 1;
    this.handleCurrentMonth();
    this.handleChangeMiniCalendar(this.monthIndex);
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
    } catch (error: any) {
      console.error(error);
      this.alerts
        .open('', { label: error?.message, status: 'error' })
        .subscribe();
    }
  }

  async onFetchCalendars(): Promise<any> {
    this.calendarsLoading = true;
    try {
      await this.calendarService.onFetchCalendars();
      this.calendars = this.calendarService.calendars;
      if (this.calendars.length) {
        this.selectedCalendar = this.calendars[0];
      } else {
        this.showNewCalendarDialog();
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
      await this.eventService.onFetchEvents({ calendarId });
      this.events = this.eventService.events.data.map((event: any) => ({
        ...event,
        startTime: event.startTime.slice(0, -1),
        endTime: event.endTime.slice(0, -1),
        startDate: this.datePipe.transform(
          event.startTime.slice(0, -1),
          'YYYY-MM-dd'
        ),
        endDate: this.datePipe.transform(
          event.endTime.slice(0, -1),
          'YYYY-MM-dd'
        ),
        startDay: this.datePipe.transform(event.startTime.slice(0, -1), 'dd'),
        endDay: this.datePipe.transform(event.endTime.slice(0, -1), 'dd')
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
