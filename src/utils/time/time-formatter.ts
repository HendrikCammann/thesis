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

export function formatSecondsToDuration(value: number, type: FormatDurationType): any {
  switch (type) {
    case FormatDurationType.Dynamic:
      if (value > 3600) {
        let h_hours = Math.floor(value / 3600);
        let h_mutes = value % 3600;
        h_mutes = Math.floor(h_mutes / 60);
        let h_seconds = h_mutes % 60;

        let returnValue: DateHoursReturnModel = {
          absValue: value / 3600,
          single: h_hours + 'h',
          multilple: h_hours + 'h ' + h_mutes + 'm',
          all: h_hours + 'h ' + h_mutes + 'm ' + h_seconds + 's',
        };

        return returnValue;
      } else {
        let m_mutes = Math.floor(value / 60);
        let m_seconds = value % 60;

        let m_return: any = {
          absValue: value / 60,
          single: m_mutes + 'm',
          multilple: m_mutes + 'm ' + m_seconds + 's',
          all: m_mutes + 'm ' + m_seconds + 's',
        };

        if (m_mutes === 0) {
          m_return.multilple = m_seconds + 's';
        }

        return m_return;
      }

    case FormatDurationType.Minutes:
      let m_mutes = Math.floor(value / 60);
      let m_seconds = value % 60;

      let m_return: DateMinutesReturnModel = {
        absValue: value / 60,
        single: m_mutes + 'm',
        multilple: m_mutes + 'm ' + m_seconds + 's',
      };

      if (m_mutes === 0) {
        m_return.multilple = m_seconds + 's';
      }

      return m_return;

    case FormatDurationType.Hours:
      let h_hours = Math.floor(value / 3600);
      let h_mutes = value % 3600;
      h_mutes = Math.floor(h_mutes / 60);
      let h_seconds = h_mutes % 60;

      let returnValue: DateHoursReturnModel = {
        absValue: value / 3600,
        single: h_hours + 'h',
        multilple: h_hours + 'h ' + h_mutes + 'm',
        all: h_hours + 'h ' + h_mutes + 'm ' + h_seconds + 's',
      };

      return returnValue;
  }
}

export function getDayName(day: number, long: boolean) {
  if (long === undefined) {
    long = false;
  }
  if (long) {
    switch (day) {
      case 0:
        return 'Sonntag';
      case 1:
        return 'Montag';
      case 2:
        return 'Dienstag';
      case 3:
        return 'Mittwoch';
      case 4:
        return 'Donnerstag';
      case 5:
        return 'Freitag';
      case 6:
        return 'Samstag';
    }
  } else {
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
}
