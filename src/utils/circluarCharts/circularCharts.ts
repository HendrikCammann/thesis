import {FormatDistanceType} from '../../models/FormatModel';
import {formatDistance} from '../format-data';
import {getCategoryColor} from '../calculateVisualVariables';
import * as d3 from 'd3';
import {CategoryOpacity} from '../../models/VisualVariableModel';

export function calculateRadiusFromArea(value, circleParameter): number {
  value = formatDistance(value, FormatDistanceType.Kilometers);

  // means that 1000km have a radius of 70px
  const focusRadius = circleParameter.radius;
  const focusArea = Math.PI * Math.pow(focusRadius, 2);
  const focusDistance = circleParameter.maximum;

  let factorFromFocus = 100 / focusDistance * value;
  let factorArea = focusArea / 100 * factorFromFocus;

  return Math.sqrt(factorArea / Math.PI);
}
