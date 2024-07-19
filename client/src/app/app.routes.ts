import { Routes } from '@angular/router';
import { BigCalendarComponent } from './big-calendar/big-calendar.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/sign-in', pathMatch: 'full' },
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-up', component: SignUpComponent },
  {
    path: 'calendar',
    component: BigCalendarComponent,
    canActivate: [AuthGuard],
  },
];
