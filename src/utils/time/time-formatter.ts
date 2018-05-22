import {FormatDurationType} from '../../models/FormatModel';

export class DateMinutesReturnModel {
  absValue: number;
  single: string;
  multilple: string;
}

export class DateHoursReturnModel {
  absValue: number;
  single: string;
  multilple: string;
  all: string;
}

export function getWeeksBetweenDates(end, start) {
  end = new Date(end);
  start = new Date(start);
  return {
    range: Math.round((end - start) / (7 * 24 * 60 * 60 * 1000)),
    type: 'Weeks'
  };
}

export function formatSecondsToDuration(value: number, type: FormatDurationType): DateMinutesReturnModel | DateHoursReturnModel {
  switch (type) {
    case FormatDurationType.Minutes:
      let m_minutes = Math.floor(value / 60);
      let m_seconds = value % 60;

      let m_return: DateMinutesReturnModel = {
        absValue: value / 60,
        single: m_minutes + 'm',
        multilple: m_minutes + 'm ' + m_seconds + 's',
      };

      if (m_minutes === 0) {
        m_return.multilple = m_seconds + 's';
      }

      return m_return;

    case FormatDurationType.Hours:
      let h_hours = Math.floor(value / 3600);
      let h_minutes = value % 3600;
      h_minutes = Math.floor(h_minutes / 60);
      let h_seconds = h_minutes % 60;

      let returnValue: DateHoursReturnModel = {
        absValue: value / 3600,
        single: h_hours + 'h',
        multilple: h_hours + 'h ' + h_minutes + 'min',
        all: h_hours + 'h ' + h_minutes + 'min ' + h_seconds + 's',
      };

      return returnValue;
  }
}

export function getDayName(day: number) {
  switch (day) {
    case 0:
      return 'So';
    case 1:
      return 'Mo';
    case 2:
      return 'Di';
    case 3:
      return 'Mi';
    case 4:
      return 'Do';
    case 5:
      return 'Fr';
    case 6:
      return 'Sa';
  }
}
