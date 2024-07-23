import { Routes } from '@angular/router';

import { AuthGuard } from './auth/auth.guard';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { BigCalendarComponent } from './big-calendar/big-calendar.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { EventsComponent } from './events/events.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/sign-in',
    pathMatch: 'full'
  },
  {
    path: 'sign-in',
    component: SignInComponent
  },
  {
    path: 'sign-up',
    component: SignUpComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'reset-password/:resettoken',
    component: ResetPasswordComponent
  },
  {
    path: 'calendar',
    component: BigCalendarComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'calendar/:calendarId/events',
    component: EventsComponent,
    canActivate: [AuthGuard]
  }
];
