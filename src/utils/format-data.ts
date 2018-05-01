import {FormatDate, FormatDistanceType, FormatRadiusType} from '../models/FormatModel';

export function formatDistance(distance: number, factor: FormatDistanceType): number {
  return distance / factor;
}

export function formatRadius(distance: number, factor: FormatRadiusType): number {
  return Math.sqrt((distance / factor) / Math.PI);
}

export function getPercentualOffset(valA, valB, factor): number {
  return (Math.abs(valA - valB) * factor);
}
