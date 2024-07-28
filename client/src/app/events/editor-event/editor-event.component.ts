import { Inject, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import {
  TuiButtonModule,
  TuiAlertService,
  TuiRootModule,
  TuiDialogContext,
  TuiLoaderModule,
  TuiDialogService
} from '@taiga-ui/core';
import {
  TuiInputModule,
  TuiTextareaModule,
  TuiInputDateModule,
  TuiInputDateTimeModule,
  TuiCheckboxLabeledModule,
  TuiInputTimeModule,
  tuiCreateTimePeriods,
  TuiPromptData,
  TUI_PROMPT
} from '@taiga-ui/kit';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DIALOG_DATA } from '../../dialog-tokens';
import { UtilsService } from '../../utils/utils.service';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-editor-event',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    TuiRootModule,
    TuiInputModule,
    TuiLoaderModule,
    TuiButtonModule,
    TuiTextareaModule,
    TuiInputDateModule,
    ReactiveFormsModule,
    TuiInputDateTimeModule,
    TuiCheckboxLabeledModule,
    TuiInputTimeModule
  ],
  templateUrl: './editor-event.component.html',
  styleUrl: './editor-event.component.css'
})
export class EditorEventComponent implements OnInit {
  editorEventForm: FormGroup;
  isLoading: boolean = false;
  eventId: string = '';
  timePeriods = tuiCreateTimePeriods();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private utils: UtilsService,
    private eventService: EventService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService,
    @Inject(DIALOG_DATA) public data: any,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean>
  ) {
    const { miniCalendarValue } = this.data;
    this.editorEventForm = this.fb.group(
      {
        title: ['', [Validators.required]],
        description: ['', [Validators.required]],
        location: ['', [Validators.required]],
        startDate: [miniCalendarValue, [Validators.required]],
        endDate: [miniCalendarValue, [Validators.required]],
        startTime: [null],
        endTime: [null],
        allDay: [true]
      },
      {
        validators: [
          this.utils.endDateAfterStartDateValidator('startDate', 'endDate'),
          this.utils.endDateAfterStartDateValidator('startTime', 'endTime')
        ]
      }
    );
    this.onFetchEvent();
  }

  ngOnInit(): void {
    this.editorEventForm.get('allDay')!.valueChanges.subscribe(value => {
      if (value) {
        this.removeRequiredValidators();
      } else {
        this.setRequiredValidators();
      }
      this.editorEventForm.get('startTime')!.updateValueAndValidity();
      this.editorEventForm.get('endTime')!.updateValueAndValidity();
    });
  }

  setRequiredValidators(): void {
    this.editorEventForm.get('startTime')!.setValidators([Validators.required]);
    this.editorEventForm.get('endTime')!.setValidators([Validators.required]);
  }

  removeRequiredValidators(): void {
    this.editorEventForm.get('startTime')!.clearValidators();
    this.editorEventForm.get('endTime')!.clearValidators();
  }

  async onFetchEvent(): Promise<any> {
    const { calendarId, eventId } = this.data;
    if (!calendarId || !eventId) return;
    this.isLoading = true;
    try {
      this.eventId = eventId;
      await this.eventService.onFetchEvent({ calendarId, eventId });
      const { title, description, allDay, location, startTime, endTime } =
        this.eventService.event;
      this.editorEventForm.setValue({
        title,
        allDay,
        location,
        description,
        startDate: this.utils.transformDateToTuiDay(startTime),
        endDate: this.utils.transformDateToTuiDay(endTime),
        startTime: this.utils.transformTimeToTuiTime(startTime),
        endTime: this.utils.transformTimeToTuiTime(endTime)
      });
    } catch (error: any) {
      this.alerts
        .open('', { label: error?.message, status: 'error' })
        .subscribe();
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit(): Promise<any> {
    const { calendarId, eventId } = this.data;
    if (!calendarId) return;
    try {
      if (this.editorEventForm.valid) {
        this.isLoading = true;
        const {
          title,
          description,
          location,
          allDay,
          startDate,
          endDate,
          startTime,
          endTime
        } = this.editorEventForm.value;
        const transformStartDateTime =
          this.utils.transformTuiDayTuiTimeToDateTime([startDate, startTime]);
        const transformEndDateTime =
          this.utils.transformTuiDayTuiTimeToDateTime([endDate, endTime]);
        if (eventId) {
          await this.eventService.onUpdateEvent({
            calendarId,
            eventId,
            title,
            description,
            location,
            allDay,
            startTime: transformStartDateTime,
            endTime: transformEndDateTime
          });
        } else {
          await this.eventService.onCreateEvent({
            calendarId,
            eventId,
            title,
            description,
            location,
            allDay,
            startTime: transformStartDateTime,
            endTime: transformEndDateTime
          });
        }
        this.context.completeWith(true);
      }
    } catch (error: any) {
      this.alerts
        .open('', { label: error?.message, status: 'error' })
        .subscribe();
    } finally {
      this.isLoading = false;
      this.context.completeWith(false);
    }
  }

  onConfirmDeleteCalender(): void {
    const data: TuiPromptData = {
      content: 'You will delete this event!',
      yes: 'Confirm',
      no: 'Cancel'
    };

    this.dialogs
      .open<boolean>(TUI_PROMPT, {
        label: 'Are you sure you want delete?',
        size: 's',
        data
      })
      .subscribe({
        next: data => {
          if (data) {
            this.onDeleteEvent();
          }
        }
      });
  }

  async onDeleteEvent(): Promise<any> {
    const { calendarId, eventId } = this.data;
    if (!calendarId || !eventId) return;
    this.isLoading = true;
    try {
      await this.eventService.onDeleteEvent({
        calendarId,
        eventId
      });
    } catch (error: any) {
      this.alerts
        .open('', { label: error?.message, status: 'error' })
        .subscribe();
    } finally {
      this.isLoading = false;
      this.context.completeWith(false);
    }
  }
}
