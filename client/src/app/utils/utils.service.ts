import dayjs from 'dayjs';
import { Injectable } from '@angular/core';
import { TuiDay, TuiTime } from '@taiga-ui/cdk';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  constructor() {}

  getMonth(month = dayjs().month()) {
    month = Math.floor(month);
    const year = dayjs().year();
    const firstDayOfTheMonth = dayjs(new Date(year, month, 1)).day();
    let currentMonthCount = 0 - firstDayOfTheMonth;
    const daysMatrix = new Array(5).fill([]).map(() => {
      return new Array(7).fill(null).map(() => {
        currentMonthCount++;
        return dayjs(new Date(year, month, currentMonthCount));
      });
    });
    return daysMatrix;
  }

  endDateAfterStartDateValidator(
    startDateKey: string,
    endDateKey: string
  ): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const startDate = formGroup.get(startDateKey)?.value;
      const endDate = formGroup.get(endDateKey)?.value;

      if (startDate && endDate && endDate < startDate) {
        return { endDateBeforeStartDate: true };
      }
      return null;
    };
  }

  transformTuiDayToDate(date: TuiDay): string {
    const year = date.year;
    const month = (date.month + 1).toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    return `${year}-${month}-${day} 00:00:00+00`;
  }

  transformTuiDayTuiTimeToDateTime(dateTime: [TuiDay, TuiTime]): string {
    const [day, time] = dateTime;
    const year = day.year;
    const month = (day.month + 1).toString().padStart(2, '0');
    const date = day.day.toString().padStart(2, '0');
    const hours = time.hours.toString().padStart(2, '0');
    const minutes = time.minutes.toString().padStart(2, '0');
    const seconds = time.seconds.toString().padStart(2, '0');
    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}+00`;
  }

  transformDateToTuiDay(dateTime: string): TuiDay {
    const date = new Date(dateTime);
    return new TuiDay(date.getFullYear(), date.getMonth(), date.getDate());
  }

  transformTimeToTuiTime(dateTime: string): TuiTime {
    const date = new Date(dateTime);
    return new TuiTime(date.getHours(), date.getMinutes());
  }

  transformDateTimeToTuiDay(dateTime: string): [TuiDay, TuiTime] {
    const date = new Date(dateTime);
    return [
      new TuiDay(date.getFullYear(), date.getMonth(), date.getDate()),
      new TuiTime(date.getHours(), date.getMinutes(), date.getSeconds())
    ];
  }
}
