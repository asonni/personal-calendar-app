import dayjs from 'dayjs';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { UtilsService } from '../utils/utils.service';

@Component({
  selector: 'app-big-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './big-calendar.component.html',
  styleUrl: './big-calendar.component.css'
})
export class BigCalendarComponent implements OnInit {
  currentDay: any;
  currentMonth: any;
  monthIndex = dayjs().month();
  dayJs = dayjs();

  constructor(
    private authService: AuthService,
    private router: Router,
    private utils: UtilsService
  ) {
    this.handleCurrentMonth();
  }

  ngOnInit(): void {}

  handleCurrentMonth() {
    console.log(this.monthIndex);
    this.currentMonth = this.utils.getMonth(this.monthIndex);
    this.currentDay = dayjs(new Date(dayjs().year(), this.monthIndex)).format(
      'MMMM YYYY'
    );
  }

  handlePrevMonth() {
    this.monthIndex -= 1;
    this.handleCurrentMonth();
  }

  handleNextMonth() {
    this.monthIndex += 1;
    this.handleCurrentMonth();
  }

  handleReset() {
    this.monthIndex = dayjs().month();
    this.handleCurrentMonth();
  }

  getCurrentDayClass(day: any) {
    return day.format('DD-MM-YY') === dayjs().format('DD-MM-YY') ? true : false;
  }

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
