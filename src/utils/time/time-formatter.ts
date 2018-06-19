import {FormatDate, FormatDurationType} from '../../models/FormatModel';
import * as moment from 'moment';
import {TimeRangeModel} from '../../models/Filter/FilterModel';

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

export function getDayNameFromDate(date: number, long: boolean) {
  if (long === undefined) {
    long = false;
  }
  if (long) {
    switch (moment(date).weekday()) {
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
    switch (moment(date).weekday()) {
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


export function formatDate(data: any, type: FormatDate) {
  moment.locale('de');
  switch (type) {
    case FormatDate.Hour:
      return moment(data).format('HH:mm');
    case FormatDate.Day:
      return moment(data).format('DD.MM.YYYY');
  }
}

export function getTimeRange(data: any, type: FormatDate) {
  moment.locale('de');
  let start;
  let end;
  switch (type) {
    case FormatDate.Week:
      start = moment(data).startOf('week').format('DD.MM');
      end = moment(data).endOf('week').format('DD.MM.YYYY');
      break;
    case FormatDate.Month:
      start = moment(data).startOf('month').format('DD.MM');
      end = moment(data).endOf('month').format('DD.MM.YYYY');
      break;
  }

  return start + ' - ' + end;
}

export function checkIfDateIsInRange(range: TimeRangeModel, date: any) {
  let d = moment(date);
  let start = moment(range.start);
  let end = moment(range.end);

  return d.isBetween(start, end);
}
