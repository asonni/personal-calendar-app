import { InjectionToken } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';

export const DIALOG_CONTEXT = new InjectionToken<TuiDialogContext<void>>(
  'DialogContext'
);
