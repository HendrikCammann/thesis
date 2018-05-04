import {FormatDate, FormatDistanceType, FormatPaceType, FormatRadiusType} from '../models/FormatModel';

export function formatDistance(distance: number, factor: FormatDistanceType): number {
  return distance / factor;
}

function formatPaceToRunOutput (pace: number, factor: number) {
  const SecondsInHour = 3600;
  const paceInFactor = pace * factor;

  let secondsPerKm = SecondsInHour / paceInFactor;
  let minPerFactor = secondsPerKm / 60;

  let formattedMinPerFactor = Math.floor(secondsPerKm / 60);
  let formattedMinPerFactorRest = Math.round(secondsPerKm - (formattedMinPerFactor * 60)).toString();
  if (formattedMinPerFactorRest.length === 1) {
    formattedMinPerFactorRest = '0' + formattedMinPerFactorRest;
  }

  return {
    absValue: minPerFactor,
    formattedVal: formattedMinPerFactor + ':' + formattedMinPerFactorRest,
  };
}

export function formatPace(pace: number, target: FormatPaceType) {
  switch (target) {
    case FormatPaceType.Kmh:
      return {
        absValue: pace * 3.6,
        formattedVal: pace * 3.6,
      };

    case FormatPaceType.Mph:
      return {
        absValue: pace * 2.23694,
        formattedVal: pace * 2.23694,
      };

    case FormatPaceType.MinPerKm:
      return formatPaceToRunOutput(pace, 3.6);

    case FormatPaceType.MinPerMile:
      return formatPaceToRunOutput(pace, 2.23694);
  }
}

export function formatRadius(distance: number, factor: FormatRadiusType): number {
  return Math.sqrt((distance / factor) / Math.PI);
}

export function getPercentualOffset(valA, valB, factor): number {
  return (Math.abs(valA - valB) * factor);
}
