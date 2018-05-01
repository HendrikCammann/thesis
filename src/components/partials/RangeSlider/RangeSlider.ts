/* tslint:disable */
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';
import * as d3 from 'd3';
import {filterBus} from '../../../main';
import {filterEvents} from '../../../events/filter';

@Component({
  template: require('./rangeSlider.html'),
})
export class RangeSlider extends Vue {
  mounted() {
    let width = 1140;
    let height = 15;

    let svg = d3.select('#rangeSlider').append('svg')
      .attr('width', width)
      .attr('height', height + 5);

    let x = d3.scaleLinear()
      .domain([0, width])
      .range([0, width]);

    let brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on('end', function() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;
        filterBus.$emit(filterEvents.set_Compare_Time_Range, d3.event.selection.map(x.invert));
      });

    let g = svg.append('g')
      .attr('class', 'brush')
      .call(brush);

    g.selectAll('rect')
      .attr('height', height);
    g.selectAll('.overlay')
      .attr('rx', 7)
      .attr('ry', 7)
      .style('fill', '#E6E6E6');
    g.selectAll('.selection')
      .attr('fill', null)
      .attr('fill-opacity', 1)
      .style('fill', '#9D9D9D');
    g.selectAll('rect.handle')
      .attr('width', 15)
      .attr('height', 15)
      .style('fill', '#454545');

    this.positionBrush(g, brush,[0, width].map(x));
  }

  private positionBrush(g: any, brush, pos: any) {
    brush.move(g, pos);
  }
}
