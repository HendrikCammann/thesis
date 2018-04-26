/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';

@Component({
  template: require('./stackedCompare.html'),
})
export class StackedCompare extends Vue {
  private stackedCompare() {
    let data = [10, 25, 50];
    let data2 = [5, 50, 10];

    let spacing = 2;

    let sum = data.reduce((a, b) => a + b, 0) + data2.reduce((a, b) => a + b, 0);

    let svg = d3.select('#stacked')
      .append('svg')
      .attr('width', 1200)
      .attr('height', 1000);

    let mappedValue = d3.scaleLinear()
      .domain([0, sum])
      .range([0, 300]);

    let map1 = d3.scaleLinear().domain([0, d3.max(data)]).range([0, 300]);
    let map2 = d3.scaleLinear().domain([0, d3.max(data2)]).range([0, 300]);

    let xPos = 10;
    data.map(item => {
      svg.append('rect')
        //.attr('width', mappedValue(item))
        .attr('width', map1(item))
        .attr('height', 30)
        .attr('fill', 'red')
        .attr('x', xPos)
        .attr('y', 10);

      // xPos += (mappedValue(item) + spacing);
      xPos += (map1(item) + spacing)
    });

    xPos = 10;
    data2.map(item => {
      svg.append('rect')
        //.attr('width', mappedValue(item))
        .attr('width', map2(item))
        .attr('height', 30)
        .attr('fill', 'red')
        .attr('x', xPos)
        .attr('y', 70);

      // xPos += (mappedValue(item) + 2);
      xPos += (map2(item) + spacing)

    })

  }

  mounted() {
    this.stackedCompare();
  }
}
