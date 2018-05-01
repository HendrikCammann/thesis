/* tslint:disable */
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';
import * as d3 from 'd3';

@Component({
  template: require('./donutChart.html'),
})
export class DonutChart extends Vue {

  @Prop()
  root: string;

  private addDataToPie(pie: any, data: any) {
    return (pie(data));
  }

  private donutChart(root) {
    let data = [
      {name: 'USA', value: 40},
      {name: 'UK', value: 20},
      {name: 'Canada', value: 30},
      {name: 'Maxico', value: 10},
    ];

    let text = '';

    let width = 260;
    let height = 260;
    let thickness = 40;
    let duration = 750;

    let radius = Math.min(width, height) / 2.5;
    let color = d3.scaleOrdinal(d3.schemeCategory10);

    let svg = d3.select(root)
      .append('svg')
      .attr('class', 'pie')
      .attr('width', width)
      .attr('height', height);

    let g = svg.append('g')
      .attr('transform', 'translate(' + (width/2) + ',' + (height/2) + ')');

    let arc = d3.arc()
      .innerRadius(radius - thickness)
      .outerRadius(radius);

    let pie = d3.pie()
      .value(function(d: any) { return d.value; })
      .sort(null);

    let path = g.selectAll('path')
      .data(this.addDataToPie(pie, data))
      .enter()
      .append('g')
      .on('mouseover', function(d: any) {
        let g = d3.select(this)
          .style('cursor', 'pointer')
          .style('fill', 'black')
          .append('g')
          .attr('class', 'text-group');

        g.append('text')
          .attr('class', 'name-text')
          .text(`${d.data.name}`)
          .attr('text-anchor', 'middle')
          .attr('dy', '-1.2em');

        g.append('text')
          .attr('class', 'value-text')
          .text(`${d.data.value}`)
          .attr('text-anchor', 'middle')
          .attr('dy', '.6em');
      })
      .on('mouseout', function(d) {
        d3.select(this)
          .select('.text-group').remove();
      })
      .append('path')
      .attr('d', arc)
      .attr('fill', (d,i: any) => color(i));

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .text(text);
  }

  mounted() {
    this.donutChart('#' + this.root);
  }
}
