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
  averageHR: number;

  mounted() {
    let m = [80, 80, 80, 80]; // margins
    let w = 1000 - m[1] - m[3]; // width
    let h = 400 - m[0] - m[2]; // height

    // create a simple data array that we'll plot with a line (this array represents only the Y values, X will just be the index location)
    let data = {
      values: this.valueDATA.data,
      scale: this.distanceDATA.data
    };

    let avgLine = {
      values: [],
      scale: this.distanceDATA.data
    };

    let displayedData = [];

    for (let i = 0; i < this.distanceDATA.data.length; i++) {
      let obj = {
        value: this.valueDATA.data[i],
        distance: this.distanceDATA.data[i]
      };
      displayedData.push(obj);

      avgLine.values[i] = this.averageHR;
    }

    console.log(displayedData);

    // X scale will fit all values from data[] within pixels 0-w
    let x = d3.scaleLinear().domain([0, displayedData.length]).range([0, w]);
    // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
    let y = d3.scaleLinear().domain([0, Math.max(...this.valueDATA.data) + 10]).range([h, 10]);
    // automatically determining max range can work something like this
    // let y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);

    // create a line function that can convert data[] into x and y points
    let line = d3.line()
    // assign the X function to plot our line as we wish
      .x(function(d, i) {
        return x(i);
      })
      .y(function(d) {
        // verbose logging to show what's actually being done
        // console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + ' using our yScale.');
        // return the Y coordinate where we want to plot this datapoint
        return y(d);
      });

    // Add an SVG element with the desired dimensions and margin.
    let graph = d3.select('#tests').append('svg:svg')
      .attr('width', w + m[1] + m[3])
      .attr('height', h + m[0] + m[2])
      .append('svg:g')
      .attr('transform', 'translate(' + m[3] + ',' + m[0] + ')');

    // create yAxis
    let xAxis = d3.axisBottom(x).tickSize(-h);
    // Add the x-axis.
    graph.append('svg:g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (h + 0) + ')')
      .call(xAxis);


    // create left yAxis
    let yAxisLeft = d3.axisLeft(y).ticks(10);
    // Add the y-axis to the left
    graph.append('svg:g')
      .attr('class', 'y axis')
      .call(yAxisLeft);

    // Add the line by appending an svg:path element with the data line we created above
    // do this AFTER the axes above so that the line is above the tick-lines
    graph.append('svg:path').attr('class', 'heartrate').attr('d', line(data.values));
    // graph.append('svg:path').attr('class', 'heartrate__avg').attr('d', line(avgLine.values));
  }
}
