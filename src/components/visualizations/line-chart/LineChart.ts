/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {setupSvg} from '../../../utils/svgInit/svgInit';

@Component({
  template: require('./LineChart.html'),
})
export class LineChart extends Vue {
  @Prop()
  data: any;


  private margin = {top: 16, right: 4, bottom: 16, left: 4};
  private width = 340 - this.margin.left - this.margin.right;
  private height = 300 - this.margin.top - this.margin.bottom;

  @Watch('data')
  onPropertyChanged(val: any, oldVal: any) {
    console.log('changed');
  }

  mounted() {
    this.lineChart(this.data);
  }

  private lineChart(data) {
    let svg = d3.select('#line').append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    let lineData = this.initData(data);
    this.drawData(svg, lineData);
  }

  private initData(data) {
    let displayedData = [];
    for (let i = 0; i < data.distanceValues.length; i = i + 10) {
      if(data.hrValues) {
        displayedData.push({
          avgPace: data.avgPace,
          pace: data.paceValues[i],
          avgHr: data.avgHr,
          heartrate: data.hrValues[i],
          scales: data.distanceValues[i] / 1000,
        })
      } else {
        displayedData.push({
          avgPace: data.avgPace,
          pace: data.paceValues[i],
          avgHr: null,
          heartrate: null,
          scales: data.distanceValues[i] / 1000,
        })
      }
    }

    return displayedData;
  }

  private drawData(svg, data) {
    let hasHeartrate = true;

    data.map((d) => {
      d.avgPace = +d.avgPace;
      d.pace = +d.pace;
      if (d.heartrate !== null) {
        d.avgHr = +d.avgHr;
        d.heartrate = +d.heartrate;
      } else {
        hasHeartrate = false;
      }
      d.scales = +d.scales;
    });

    let x = d3.scaleLinear().range([0, this.width]);
    let y = d3.scaleLinear().range([this.height, 0]);
    let y2 = d3.scaleLinear().range([this.height, 0]);

    x.domain([data[0].scales, data[data.length -1].scales]);
    y2.domain([0, 200 + 10]);
    y.domain([0, 10]);

    console.log(this.data.maxPace);

    let paceLine = d3.line()
      .x((d: any, i) => {
        return x(d.scales);
      })
      .y((d: any, i) => {
        return y(d.pace);
      }).curve(d3.curveCardinal);

    let avgPaceLine = d3.line()
      .x((d, i) => {
        return x(data[i].scales);
      })
      .y((d, i) => {
        return y(data[i].avgPace);
      });

    let hrLine;
    let avgHrLine;
    if(hasHeartrate) {
      hrLine = d3.line()
        .x((d: any, i) => {
          return x(d.scales);
        })
        .y((d:any, i) => {
          return y2(d.heartrate);
        }).curve(d3.curveCardinal);

      avgHrLine = d3.line()
        .x((d, i) => {
          return x(data[i].scales);
        })
        .y((d, i) => {
          return y2(data[i].avgHr);
        });
    }


    svg.append('path')
      .data([data])
      .attr('class', 'lineChart__pace')
      .attr('d', paceLine(data));

    if(hasHeartrate) {
      svg.append('path')
        .data([data])
        .attr('class', 'lineChart__heartrate')
        .attr('d', hrLine(data));
    }

    svg.append('path')
      .data([data])
      .attr('class', 'lineChart__pace--avg')
      .attr('d', avgPaceLine(data));

    if(hasHeartrate) {
      svg.append('path')
        .data([data])
        .attr('class', 'lineChart__heartrate--avg')
        .attr('d', avgHrLine(data));
    }

    svg.append('g')
      .attr('transform', 'translate(0,' + (this.height) + ')')
      // .call(d3.axisBottom(x).ticks(14).tickSize(-height));
      .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append('g')
    // .call(d3.axisLeft(y).ticks(6).tickSize(-width))
      .attr('class', 'lineChart__scale--pace')
      .call(d3.axisRight(y));

    // Add the Y Axis
    if(hasHeartrate) {
      svg.append('g')
        .attr('transform', 'translate(' + (this.width) + ', 0)')
        .attr('class', 'lineChart__scale--heartrate')
        .call(d3.axisLeft(y2));
    }
  }
}
