import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { defaultEditorColors, TuiInputColorModule } from '@tinkoff/tui-editor';
import {
  TuiButtonModule,
  TuiAlertService,
  TuiRootModule,
  TuiDialogContext,
  TuiLoaderModule,
  TuiDialogService
} from '@taiga-ui/core';
import { Inject, Component } from '@angular/core';
import {
  TUI_PROMPT,
  TuiInputModule,
  TuiTextareaModule,
  TuiInputDateTimeModule,
  TuiPromptData
} from '@taiga-ui/kit';
import {
  FormGroup,
  Validators,
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DIALOG_DATA } from '../../dialog-tokens';
import { CalendarService } from '../../services/calendar.service';

@Component({
  selector: 'app-editor-calendar',
  standalone: true,
  imports: [
    CommonModule,
    TuiRootModule,
    TuiInputModule,
    TuiLoaderModule,
    TuiButtonModule,
    TuiTextareaModule,
    ReactiveFormsModule,
    TuiInputDateTimeModule,
    TuiInputColorModule
  ],
  templateUrl: './editor-calendar.component.html',
  styleUrl: './editor-calendar.component.css'
})
export class EditorCalendarComponent {
  calendarId: string = '';
  editorCalendarForm: FormGroup;
  isLoading: boolean = false;
  readonly palette = defaultEditorColors;

  constructor(
    private fb: FormBuilder,
    private calendarService: CalendarService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService,
    @Inject(DIALOG_DATA) public data: any,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean>
  ) {
    this.editorCalendarForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      color: ['#ffdd2d', [Validators.required, Validators.minLength(7)]]
    });
    this.onFetchCalendar();
  }

  async onFetchCalendar(): Promise<any> {
    const { calendarId } = this.data;
    if (!calendarId) return;
    this.calendarId = calendarId;
    this.isLoading = true;
    try {
      await this.calendarService.onFetchCalendar({ calendarId });
      const { name, description, color } = this.calendarService.calendar;
      this.editorCalendarForm.setValue({
        name,
        description,
        color
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
    const { calendarId } = this.data;
    try {
      if (this.editorCalendarForm.valid) {
        this.isLoading = true;
        const { name, description, color } = this.editorCalendarForm.value;
        if (calendarId) {
          await this.calendarService.onUpdateCalendar({
            calendarId,
            name,
            description,
            color
          });
        } else {
          await this.calendarService.onCreateCalendar({
            name,
            description,
            color
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
      content:
        'By deleting this calendar, you will also delete all associated events.',
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
            this.onDeleteCalendar();
          }
        }
      });
  }

  async onDeleteCalendar(): Promise<any> {
    const { calendarId } = this.data;
    if (!calendarId) return;
    this.isLoading = true;
    try {
      await this.calendarService.onDeleteCalendar({ calendarId });
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
