/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {setupSvg} from '../../../utils/svgInit/svgInit';
import {formatPace} from '../../../utils/format-data';
import {FormatPaceType} from '../../../models/FormatModel';
import {getLargerValue} from '../../../utils/numbers/numbers';
import {CategoryColors, ZoneColors} from '../../../models/VisualVariableModel';

@Component({
  template: require('./LineChart.html'),
})
export class LineChart extends Vue {
  @Prop()
  data: any;


  private margin = {top: 16, right: 4, bottom: 16, left: 4};
  private width = 340 - this.margin.left - this.margin.right;
  private height = 300 - this.margin.top - this.margin.bottom;
  private maxPace = 0;
  private maxHr = 0;

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
    let factor = Math.round(data.distanceValues.length / 100 * 3);
    for (let i = 0; i < data.distanceValues.length; i = i + factor) {
      this.maxPace = getLargerValue(data.paceValues[i], this.maxPace);
      if(data.hrValues) {
        this.maxHr = getLargerValue(data.hrValues[i], this.maxHr);
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

    let avgPage = 0;
    let avgHr = 0;

    data.map((d) => {
      d.avgPace = +d.avgPace;
      avgPage = +d.avgPace;
      d.pace = +d.pace;
      console.log(d.pace);
      if (d.heartrate !== null) {
        d.avgHr = +d.avgHr;
        avgHr = +d.avgHr;
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
    y2.domain([0, this.maxHr]);
    y.domain([0, this.maxPace]);

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

    // console.log(avgPage);

    svg.append('linearGradient')
      .attr('id', 'pace-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', y(avgPage))
      .attr('x2', 0).attr('y2', y(avgPage) + 0.1)
      .selectAll('stop')
      .data([
        {offset: '0%', color: ZoneColors.Pace},
        {offset: '50%', color: ZoneColors.Pace},
        {offset: '50%', color: ZoneColors.PaceLight},
        {offset: '100%', color: ZoneColors.PaceLight}
      ])
      .enter().append('stop')
      .attr('offset', function(d) { return d.offset; })
      .attr('stop-color', function(d) { return d.color; });

    svg.append('linearGradient')
      .attr('id', 'hr-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', y2(avgHr))
      .attr('x2', 0).attr('y2', y2(avgHr) + 0.1)
      .selectAll('stop')
      .data([
        {offset: '0%', color: ZoneColors.Heartrate},
        {offset: '50%', color: ZoneColors.Heartrate},
        {offset: '50%', color: ZoneColors.HeartrateLight},
        {offset: '100%', color: ZoneColors.HeartrateLight}
      ])
      .enter().append('stop')
      .attr('offset', function(d) { return d.offset; })
      .attr('stop-color', function(d) { return d.color; });

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
      .call(d3.axisBottom(x).ticks(5).tickFormat((d :any) => {
        return d + 'km';
      }));

    // Add the Y Axis
    svg.append('g')
    // .call(d3.axisLeft(y).ticks(6).tickSize(-width))
      .attr('class', 'lineChart__scale--pace')
      .call(d3.axisRight(y).ticks(5).tickFormat((d :any) => {
        if (d !== 0) {
          return formatPace(d, FormatPaceType.MinPerKm).formattedVal + '/km';
        } else {
          return d;
        }
      }));

    svg.append('text')
      .attr('transform', 'translate(' + -16 + ',' + (this.height / 2) +') rotate(-90)')
      .attr('class', 'lineChart__label--pace')
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Pace');

    // Add the Y Axis
    if(hasHeartrate) {
      svg.append('g')
        .attr('transform', 'translate(' + (this.width) + ', 0)')
        .attr('class', 'lineChart__scale--heartrate')
        .call(d3.axisLeft(y2).ticks(5));

      svg.append('text')
        .attr('transform', 'translate(' + (this.width + 16) + ',' + (this.height / 2) +') rotate(90)')
        .attr('class', 'lineChart__label--heartrate')
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Herzfrequenz');
    }
  }
}
