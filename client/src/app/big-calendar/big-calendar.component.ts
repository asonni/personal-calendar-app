import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-big-calendar',
  standalone: true,
  imports: [],
  templateUrl: './big-calendar.component.html',
  styleUrl: './big-calendar.component.css'
})
export class BigCalendarComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onLogout(): Promise<any> {
    try {
      await this.authService.logout();
      if (!this.authService.isAuthenticated()) {
        this.router.navigate(['/sign-in']);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
