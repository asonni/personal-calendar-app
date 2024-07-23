import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { Router, RouterLink } from '@angular/router';
import {
  TuiButtonModule,
  TuiAlertService,
  TuiRootModule,
  TuiDialogContext
} from '@taiga-ui/core';
import { Inject, Component } from '@angular/core';
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
import { DIALOG_DATA } from '../../dialog-tokens';

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
  styleUrl: './new-event.component.css'
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
    @Inject(DIALOG_DATA) public data: any,
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
        allDay: [true]
      },
      {
        validators: this.utils.endDateAfterStartDateValidator(
          'startTime',
          'endTime'
        )
      }
    );
  }

  async onSubmit(): Promise<any> {
    const { calendarId } = this.data;
    if (!calendarId) return;
    try {
      if (this.newEventForm.valid) {
        this.isLoading = true;
        const { title, description, location, allDay } =
          this.newEventForm.value;
        const startTime = allDay
          ? this.utils.transformDate(this.newEventForm.value.startTime)
          : this.utils.transformDateTime(this.newEventForm.value.startTime);
        const endTime = allDay
          ? this.utils.transformDate(this.newEventForm.value.endTime)
          : this.utils.transformDateTime(this.newEventForm.value.endTime);
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
      this.context.completeWith(false);
    }
  }
}
