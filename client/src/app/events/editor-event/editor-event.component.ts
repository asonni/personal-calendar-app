import { Inject, Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import {
  TuiButtonModule,
  TuiAlertService,
  TuiRootModule,
  TuiDialogContext,
  TuiLoaderModule
} from '@taiga-ui/core';
import {
  TuiInputModule,
  TuiTextareaModule,
  TuiInputDateModule,
  TuiInputDateTimeModule,
  TuiCheckboxLabeledModule
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
    TuiCheckboxLabeledModule
  ],
  templateUrl: './editor-event.component.html',
  styleUrl: './editor-event.component.css'
})
export class EditorEventComponent {
  editorEventForm: FormGroup;
  isLoading: boolean = false;
  eventId: string = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private utils: UtilsService,
    private eventService: EventService,
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
        startTime: [miniCalendarValue, [Validators.required]],
        endTime: [miniCalendarValue, [Validators.required]],
        allDay: [true]
      },
      {
        validators: this.utils.endDateAfterStartDateValidator(
          'startTime',
          'endTime'
        )
      }
    );
    this.onFetchEvent();
  }

  onChangeAllDay() {
    const { title, description, allDay, location } = this.eventService.event;
    this.editorEventForm.setValue({
      title,
      allDay,
      location,
      description,
      startTime: null,
      endTime: null
    });
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
        startTime: allDay
          ? this.utils.transformDateToTuiDay(new Date(startTime))
          : this.utils.transformDateTimeToTuiDay(new Date(startTime)),
        endTime: allDay
          ? this.utils.transformDateToTuiDay(new Date(endTime))
          : this.utils.transformDateTimeToTuiDay(new Date(endTime))
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
        const { title, description, location, allDay, startTime, endTime } =
          this.editorEventForm.value;
        const transformedStartTime = allDay
          ? this.utils.transformTuiDayToDate(startTime)
          : this.utils.transformTuiDayToDateTime(startTime);
        const transformedEndTime = allDay
          ? this.utils.transformTuiDayToDate(endTime)
          : this.utils.transformTuiDayToDateTime(endTime);
        if (eventId) {
          await this.eventService.onUpdateEvent({
            calendarId,
            eventId,
            title,
            description,
            location,
            allDay,
            startTime: transformedStartTime,
            endTime: transformedEndTime
          });
        } else {
          await this.eventService.onCreateEvent({
            calendarId,
            eventId,
            title,
            description,
            location,
            allDay,
            startTime: transformedStartTime,
            endTime: transformedEndTime
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
