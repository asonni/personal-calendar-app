import dayjs from 'dayjs';
import { Injectable } from '@angular/core';
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
}
