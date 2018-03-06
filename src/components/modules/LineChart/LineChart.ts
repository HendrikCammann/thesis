/* tslint:disable */
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';
import * as d3 from 'd3';

@Component({
  template: require('./LineChart.html'),
})
export class LineChart extends Vue {

  @Prop()
  valueDATA: any;

  @Prop()
  distanceDATA: any;

  @Prop()
  paceDATA: any;

  @Prop()
  averageHR: number;

  @Prop()
  maxHR: number;

  @Prop()
  maxPace: number;

  mounted() {
    let displayedData = [];
    let that = this;

    for (let i = 0; i < this.distanceDATA.data.length; i = i + 1) {
      let obj = {
        value: this.valueDATA.data[i],
        scales: this.distanceDATA.data[i] / 1000,
        avg: this.averageHR,
        pace: this.paceDATA.data[i]
      };
      displayedData.push(obj);
    }

    let margin = {top: 20, right: 50, bottom: 30, left: 50};
    let width = 960 - margin.left - margin.right;
    let height = 500 - margin.top - margin.bottom;

    let x = d3.scaleLinear().range([0, width]);
    let y = d3.scaleLinear().range([height, 0]);
    let y2 = d3.scaleLinear().range([height, 0]);

    let heartrateLine = d3.line()
      .x(function(d) { return x(d.scales); })
      .y(function(d) { return y(d.value); });

    let averageLine = d3.line()
      .x(function(d) { return x(d.scales); })
      .y(function(d) { return y(d.avg); });

    let paceLine = d3.line()
      .x(function(d) { return x(d.scales); })
      .y(function(d) { return y2(d.pace); });

    let svg = d3.select('#tests').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    function draw (data) {
      // format the data
      data.forEach(function(d) {
        d.scales = +d.scales;
        d.value = +d.value;
        d.avg = +d.avg;
        d.pace = +d.pace;
      });

      // Scale the range of the data
      x.domain([data[0].scales, data[data.length - 1].scales]);
      y.domain([0, that.maxHR + 10]);
      y2.domain([0, that.maxPace + 1]);

      let area = d3.area()
      // Same x axis (could use .x0 and .x1 to set different ones)
        .x(function(d, i) { return x(data[i].scales); })
        .y0(function(d, i) { return y(data[i].value); })
        .y1(function(d, i) { return y2(data[i].pace); });

      svg.append("path")
        .datum(data)
        .attr("d", area)
        .attr("fill", "none");

      // Add the valueline path.
      svg.append('path')
        .data([data])
        .attr('class', 'heartrate')
        .attr('d', heartrateLine(data));
      svg.append('path')
        .data([data])
        .attr('class', 'heartrate__avg')
        .attr('d', averageLine(data));
      svg.append('path')
        .data([data])
        .attr('class', 'pace')
        .attr('d', paceLine(data));

      svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        // .call(d3.axisBottom(x).ticks(14).tickSize(-height));
        .call(d3.axisBottom(x));

      // Add the Y Axis
      svg.append('g')
        // .call(d3.axisLeft(y).ticks(6).tickSize(-width))
        .attr('class', 'heartrate__scale')
        .call(d3.axisLeft(y));

      // Add the Y Axis
      svg.append('g')
        .attr('transform', 'translate(' + width + ', 0)')
        .attr('class', 'pace__scale')
        .call(d3.axisRight(y2));

    }

    draw(displayedData);

  }
}
