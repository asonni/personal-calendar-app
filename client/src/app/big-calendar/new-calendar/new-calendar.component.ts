import { defaultEditorColors, TuiInputColorModule } from '@tinkoff/tui-editor';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
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
  TuiInputDateTimeModule
} from '@taiga-ui/kit';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CalendarService } from '../../services/calendar.service';

@Component({
  selector: 'app-new-calendar',
  standalone: true,
  imports: [
    CommonModule,
    TuiRootModule,
    TuiInputModule,
    TuiButtonModule,
    TuiTextareaModule,
    ReactiveFormsModule,
    TuiInputDateTimeModule,
    TuiInputColorModule
  ],
  templateUrl: './new-calendar.component.html',
  styleUrl: './new-calendar.component.css'
})
export class NewCalendarComponent {
  newCalendarForm: FormGroup;
  isLoading: boolean = false;
  readonly palette = defaultEditorColors;

  constructor(
    private fb: FormBuilder,
    private calendarService: CalendarService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean>
  ) {
    this.newCalendarForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      color: ['#ffdd2d', [Validators.required, Validators.minLength(7)]]
    });
  }

  async onSubmit(): Promise<any> {
    try {
      if (this.newCalendarForm.valid) {
        this.isLoading = true;
        const { name, description, color } = this.newCalendarForm.value;
        console.log({ name, description, color });
        await this.calendarService.onCreateCalendar({
          name,
          description,
          color
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
