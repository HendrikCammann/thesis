import * as d3 from 'd3';

export function setupSvg(root, width, height) {
  d3.select(root + ' > svg').remove();
  return d3.select(root).append('svg')
    .attr('width', width)
    .attr('height', height);
}
