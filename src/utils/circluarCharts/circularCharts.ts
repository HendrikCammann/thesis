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

export function drawHalfCircle(svg, position, radius, color, bottomHalf): void {
  let arc = d3.arc();
  let startAngle = -Math.PI * 0.5;
  let endAngle = Math.PI * 0.5;

  if (bottomHalf) {
    startAngle = Math.PI * 0.5;
    endAngle = Math.PI * 1.5;
  }

  svg.append('path')
    .attr('transform', 'translate(' + [ position.x + radius, position.y ] + ')')
    .attr('opacity', CategoryOpacity.Active)
    .attr('fill', color)
    .attr('d', arc({
      innerRadius: 0,
      outerRadius: radius,
      startAngle: startAngle,
      endAngle: endAngle
    }));
}
