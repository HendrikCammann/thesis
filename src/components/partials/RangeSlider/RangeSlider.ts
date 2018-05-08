/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {eventBus} from '../../../main';
import {filterEvents} from '../../../events/filter';

@Component({
  template: require('./rangeSlider.html'),
})
export class RangeSlider extends Vue {
  @Prop()
  index: number;

  @Prop()
  range: any;

  mounted() {
    this.rangeSlider();
  }

  private rangeSlider() {
    let width = 1140;
    let height = 15;

    let that = this;

    let svg = d3.select('#rangeSlider' + this.index).append('svg')
      .attr('width', width)
      .attr('height', height + 5);

    let x = d3.scaleLinear()
      .domain([0, width])
      .range([0, width]);

    let brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on('end', function() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;
        eventBus.$emit(filterEvents.set_Compare_Time_Range, { pos: d3.event.selection.map(x.invert), index: that.index});
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

    this.positionBrush(g, brush,[this.range.start, this.range.end].map(x));
  }

  private positionBrush(g: any, brush, pos: any) {
    brush.move(g, pos);
  }
}
