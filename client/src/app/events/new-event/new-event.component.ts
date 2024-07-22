import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { Router, RouterLink } from '@angular/router';
import {
  TuiButtonModule,
  TuiAlertService,
  TuiRootModule,
  TuiDialogContext,
  TuiDialogService
} from '@taiga-ui/core';
import { Inject, Component, ChangeDetectionStrategy } from '@angular/core';
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
import { UtilsService } from '../../utils/utils.service';
import { EventService } from '../../services/event.service';
import { TuiDay, TuiTime } from '@taiga-ui/cdk';

@Component({
  selector: 'app-new-event',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    TuiRootModule,
    TuiInputModule,
    TuiButtonModule,
    TuiTextareaModule,
    TuiInputDateModule,
    ReactiveFormsModule,
    TuiInputDateTimeModule,
    TuiCheckboxLabeledModule
  ],
  templateUrl: './new-event.component.html',
  styleUrl: './new-event.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewEventComponent {
  newEventForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private utils: UtilsService,
    private eventService: EventService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean>
  ) {
    this.newEventForm = this.fb.group(
      {
        title: ['', [Validators.required]],
        description: ['', [Validators.required]],
        location: ['', [Validators.required]],
        startTime: [null, [Validators.required]],
        endTime: [null, [Validators.required]],
        allDay: [false]
      },
      {
        validators: this.utils.endDateAfterStartDateValidator(
          'startTime',
          'endTime'
        )
      }
    );
  }

  // async transformDateTime(dateTime: string): Promise<string> {
  //   const dateObj = new Date(dateTime);
  //   const year = dateObj.getFullYear();
  //   const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  //   const date = dateObj.getDate().toString().padStart(2, '0');
  //   const hours = dateObj.getHours().toString().padStart(2, '0');
  //   const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  //   const seconds = dateObj.getSeconds().toString().padStart(2, '0');
  //   const milliseconds = dateObj.getMilliseconds().toString().padStart(6, '0');
  //   return `${year}-${date}-${month} ${hours}:${minutes}:${seconds}.${milliseconds}+00`;
  // }

  transformDate(date: TuiDay): string {
    const year = date.year;
    const month = (date.month + 1).toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    // Assuming you want to format it as "YYYY-MM-DD"
    return `${year}-${month}-${day}`;
  }

  // transformDateTime(dateTime: TuiTime): string {
  //   const year = dateTime.day.year;
  //   const month = (dateTime.day.month + 1).toString().padStart(2, '0');
  //   const day = dateTime.day.day.toString().padStart(2, '0');
  //   const hours = dateTime.time.hours.toString().padStart(2, '0');
  //   const minutes = dateTime.time.minutes.toString().padStart(2, '0');
  //   const seconds = dateTime.time.seconds.toString().padStart(2, '0');
  //   const milliseconds = dateTime.time.ms.toString().padStart(3, '0');
  //   // Assuming you want to format it as "YYYY-MM-DD HH:mm:ss.SSS"
  //   return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}+00`;
  // }

  async onSubmit(): Promise<any> {
    try {
      if (this.newEventForm.valid) {
        this.isLoading = true;
        const calendarId = '73beac6-026b-4879-b6aa-462867af56ba';
        const { title, description, location, allDay } =
          this.newEventForm.value;
        const startTime = this.transformDate(this.newEventForm.value.startTime);
        const endTime = this.transformDate(this.newEventForm.value.endTime);
        console.log({
          calendarId,
          title,
          description,
          startTime,
          endTime,
          location,
          allDay
        });
        await this.eventService.onCreateEvent({
          calendarId,
          title,
          description,
          startTime,
          endTime,
          location,
          allDay
        });
        this.context.completeWith(true);
      }
    } catch (error: any) {
      this.alerts
        .open('', { label: error?.message, status: 'error' })
        .subscribe();
    } finally {
      this.isLoading = false;
      // this.context.completeWith(false);
    }
  }
}
