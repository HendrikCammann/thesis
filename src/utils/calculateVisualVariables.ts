import {RunType} from '../store/state';
import {CategoryColors, CategoryConnectingOpacity, CategoryOpacity} from '../models/VisualVariableModel';
import {formatDistance} from './format-data';
import {FormatDistanceType} from '../models/FormatModel';

/**
 * calculates the opacity for each main group depending on filter
 * @param {RunType} filter
 * @param {RunType} type
 * @returns {number}
 */
export function calculateCategoryOpacity(filter: RunType, type: RunType): number {
  if (type == null) {
    return CategoryOpacity.Hidden;
  }
  if (filter === RunType.All) {
    return CategoryOpacity.Active;
  }
  if (type === filter) {
    return CategoryOpacity.Active;
  }
  return CategoryOpacity.Inactive;
}

/**
 * calculates the opacity for each connecting group depending on filter
 * @param {RunType} filter
 * @param {RunType} type
 * @returns {number}
 */
export function calculateConnectingOpacity(filter: RunType, type: RunType): number {
  if (type == null) {
    return CategoryConnectingOpacity.Hidden;
  }
  if (filter === RunType.All) {
    return CategoryConnectingOpacity.Active;
  }
  if (type === filter) {
    return CategoryConnectingOpacity.Active;
  }
  return CategoryConnectingOpacity.Inactive;
}

/**
 * gets the color for a single category
 * @param {RunType} type
 * @returns {string}
 */
export function getCategoryColor(type: RunType): string {
  switch (type) {
    case RunType.Run:
      return CategoryColors.Run;
    case RunType.Competition:
      return CategoryColors.Competition;
    case RunType.LongRun:
      return CategoryColors.LongRun;
    case RunType.ShortIntervals:
      return CategoryColors.ShortIntervals;
    case RunType.Uncategorized:
      return CategoryColors.Uncategorized;
    default:
      return CategoryColors.Default;
  }
}

/**
 * checks if connection is above or below the bars
 * @param {number} actualItemLength
 * @param {number} nextItemLength
 * @returns {boolean}
 */
export function getConnectingOrientation(actualItemLength: number, nextItemLength: number): boolean {
  return nextItemLength > actualItemLength;
}

/**
 * checks if a connection can be drawn
 * @param actualItem
 * @param nextItem
 * @returns {boolean}
 */
export function checkIfConnectionIsDrawable(actualItem, nextItem): boolean {
  if (actualItem.type === null) {
    return false;
  }
  if (checkIfSpecialVisual(actualItem.type)) {
    return false;
  }
  if (nextItem === undefined) {
    return false;
  }
  if (nextItem.width === 0) {
    return false;
  }
  return true;
}

export function checkIfBarIsDrawable(actualItemLength: number): boolean {
  return actualItemLength !== 0;
}

/**
 *
 * @param {RunType} type
 * @returns {boolean}
 */
export function checkIfSpecialVisual(type: RunType): boolean {
  if (type === RunType.Competition) {
    return true;
  }
  return false;
}

/**
 * calculates the length of each bar in px
 * @param {number} distance
 * @param {number} factor
 * @returns {string}
 */
export function calculateBarLength(distance: number, factor: number): string {
  distance = formatDistance(distance, FormatDistanceType.Kilometers) * factor;

  return distance.toFixed(2);
}

