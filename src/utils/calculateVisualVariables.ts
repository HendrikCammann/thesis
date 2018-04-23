import {RunType} from '../store/state';
import {
  CanvasConstraints, CategoryColors, CategoryConnectingOpacity,
  CategoryOpacity
} from '../models/VisualVariableModel';
import {formatDistance} from './format-data';
import {FormatDistanceType} from '../models/FormatModel';
import * as d3 from 'd3';

/**
 *
 * @param {Object} dataset
 * @param {CanvasConstraints} canvasContraints
 * @returns {any}
 */
export function setupVisualBarVariables(dataset: Object, canvasContraints: CanvasConstraints): any {
  let visualMeasurements = {
    padding: canvasContraints.padding,
    width: canvasContraints.width,
    height: canvasContraints.height,
    clusterMaxMargin: canvasContraints.clusterMaxMargin,
    barMargin: canvasContraints.barMargin,
    barHeight: canvasContraints.barHeight,
    calculated: {
      totalDistance: 0,
      totalClusters: 0,
      totalBars: 0,
      displayedWidth: canvasContraints.width,
      clusterMargin: 0,
      pxPerKm: 0,
    }
  };

  visualMeasurements.calculated.displayedWidth -= visualMeasurements.padding * 2;

  for (let key in dataset) {
    for (let anchor in dataset[key].stats.typeCount) {
      if (dataset[key].stats.typeCount[anchor].amount !== 0) {
        visualMeasurements.calculated.totalBars++;
      }
    }
    visualMeasurements.calculated.totalDistance += dataset[key].stats.distance;
    visualMeasurements.calculated.totalClusters++;
  }

  if (visualMeasurements.calculated.totalBars > 1) {
    visualMeasurements.calculated.displayedWidth -= ((visualMeasurements.calculated.totalBars - visualMeasurements.calculated.totalClusters) * visualMeasurements.barMargin);
  }

  if (visualMeasurements.calculated.totalClusters > 1) {
    visualMeasurements.calculated.displayedWidth = visualMeasurements.calculated.displayedWidth - visualMeasurements.clusterMaxMargin;
  }

  visualMeasurements.calculated.clusterMargin = parseFloat((visualMeasurements.clusterMaxMargin / visualMeasurements.calculated.totalClusters - 1).toFixed(2));
  visualMeasurements.calculated.totalDistance = parseFloat(formatDistance(visualMeasurements.calculated.totalDistance, FormatDistanceType.Kilometers).toFixed(2));
  visualMeasurements.calculated.pxPerKm = parseFloat((visualMeasurements.calculated.displayedWidth / visualMeasurements.calculated.totalDistance).toFixed(2));

  return visualMeasurements;
}

/**
 *
 * @param {number} actualItemLength
 * @param {number} nextItemLength
 * @param {number} factor
 * @returns {number}
 */
export function calaculateConnectingHeight(actualItemLength: number, nextItemLength: number, factor: number, maxHeight: number, canvasHeight: number, barHeight: number) {
  let height = (canvasHeight / 6) - barHeight;
  let itemHeight = parseInt((Math.abs(actualItemLength - nextItemLength) * factor).toFixed(0));
  let percentageFromMaxHeight = 100 / maxHeight * itemHeight;
  return height * percentageFromMaxHeight;
  // return parseInt((Math.abs(actualItemLength - nextItemLength) * factor).toFixed(0));
}

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
    return CategoryConnectingOpacity.SingleActive;
  }
  return CategoryConnectingOpacity.Inactive;
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

/**
 *
 * @param {number} actualItemLength
 * @returns {boolean}
 */
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
 *
 * @param {number} currentIndex
 * @param {number} innerIndex
 * @param keys
 * @param items
 * @returns {number}
 */
export function findConnectionTarget(currentIndex: number, innerIndex: number, keys: any, items: any): number {
  let indexOfItemToConnectTo = 1;

  while ((currentIndex + indexOfItemToConnectTo) < keys.length && (items[keys[currentIndex + indexOfItemToConnectTo]][innerIndex].width === 0)) {
    indexOfItemToConnectTo++;
  }

  return indexOfItemToConnectTo;
}

/**
 *
 * @param lineA
 * @param lineB
 * @returns {any}
 */
export function createAreaBetweenLines(lineA, lineB): any {
  let areaData = [];

  for (let i = 0; i < lineA.length; i++) {
    let obj = {
      xOuter: lineA[i][0],
      yOuter: lineA[i][1],
      xInner: lineB[i][0],
      yInner: lineB[i][1]
    };
    areaData.push(obj);
  }

  let area = d3.area()
    .curve(d3.curveMonotoneX)
    .x0(function (d, i) {
      return areaData[i].xOuter;
    })
    .x1(function (d, i) {
      return areaData[i].xInner;
    })
    .y0(function (d, i) {
      return areaData[i].yOuter;
    })
    .y1(function (d, i) {
      return areaData[i].yInner;
    });

  return {
    area: area,
    data: areaData,
  };
}
