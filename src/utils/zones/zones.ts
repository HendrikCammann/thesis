import {formatPace} from '../format-data';
import {FormatPaceType} from '../../models/FormatModel';

function formatPaceZone(min, max, decimalPoints) {
  if (min !== 0) {
    min = min.toFixed(decimalPoints);
    min = formatPace(min, FormatPaceType.MinPerKm);
  } else {
    min = {
      absValue: '',
      formattedVal: '',
    };
  }

  if (max !== -1) {
    max = max.toFixed(decimalPoints);
    max = formatPace(max, FormatPaceType.MinPerKm);
  } else {
    max = {
      absValue: '',
        formattedVal: '',
    };
  }

  return {
    min: min,
    max: max,
  };
}

function formatHeartrateZone(min, max, decimalPoints) {
  if (min !== 0) {
    min = {
      absValue: min.toFixed(decimalPoints),
      formattedVal: min.toFixed(decimalPoints),
    };
  } else {
    min = {
      absValue: '',
      formattedVal: '',
    };
  }

  if (max !== - 1) {
    max = {
      absValue: max.toFixed(decimalPoints),
      formattedVal: max.toFixed(decimalPoints),
    };
  } else {
    max = {
      absValue: '',
      formattedVal: '',
    };
  }

  return {
    min: min,
    max: max,
  };
}

export function formatZoneRangesToString(min, max, decimalPoints, type) {
  let data;
  switch (type) {
    case 'pace':
      data = formatPaceZone(min, max, decimalPoints);
      break;
    case 'heartrate':
      data = formatHeartrateZone(min, max, decimalPoints);
      break;

  }

  if (data.min.formattedVal === '') {
    return '< ' + data.max.formattedVal;
  }
  if (data.max.formattedVal === '') {
    return '> ' + data.min.formattedVal;
  }
  return data.min.formattedVal + ' - ' + data.max.formattedVal;
}
