import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {CategoryOpacity, ChartConstraints} from '../../../models/VisualVariableModel';
import * as d3 from 'd3';
import {RunType} from '../../../store/state';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';


@Component({
  template: require('./waveChart.html'),
})
export class WaveChart extends Vue {
  mounted() {
    this.waveChart(this.data, this.chartConstraints);
  }

  private data = [
    [{
      label: RunType.All,
      values: {
        upper: [88, 88 - 88],
        lower: [77, 88 - 77],
      },
    }],
    [{
      label: RunType.Run,
      values: {
        upper: [54, 88 - 54],
        lower: [56, 88 - 56],
      }
    }],
    [{
      label: RunType.LongRun,
      values: {
        upper: [34, 88 - 34],
        lower: [21, 88 - 21],
      }
    }],
    [{
      label: RunType.ShortIntervals,
      values: {
        upper: [22, 88 - 22],
        lower: [65, 88 - 65],
      }
    }]
  ];


  private chartConstraints = new ChartConstraints(20, 500, 500);

  private setupPie(start: number, end: number): any {
    return d3.pie()
      .sort(null)
      .startAngle(Math.PI * start)
      .endAngle(Math.PI * end)
      .value((d: any) => {
          return d;
        });
  }

  private setupArc(radius: number, width: number): any {
    return d3.arc()
      .outerRadius(radius)
      .innerRadius(radius - width);
  }

  private drawArc(anchor: any, values: number[], className: string): any {
    return anchor.selectAll('g.' + className)
      .data(values)
      .enter()
      .append('g')
      .attr('class', className);
  }

  private colorArc(anchor: any, arc: any, color: string, opacity: number, index: number, upper: boolean): any {
    let id = '';
    anchor.append('path')
      .attr('fill', color)
      .attr('id', (d: any, i: number) => {
        if (i === 0) {
          id = 'arc_' + index + '_' + d.data + '_' + d.index + '_' + upper;
        }
        return 'arc_' + index + '_' + d.data + '_' + d.index + '_' + upper;
      })
      .attr('opacity', (d: any, i: any) => {
        if (i === 1) {
          return 0;
        } else {
          return opacity;
        }
      })
      .attr('d', arc);

    return id;
  }

  private drawDivider(anchor: any, width: number, position, color: string): void {
    anchor.append('rect')
      .attr('x', position.x)
      .attr('y', position.y)
      .attr('height', 1)
      .attr('width', width)
      .attr('fill', color);
  }

  private drawArcText(anchor: any, values: any, id: string, className: string, positionY: number, opacity: number): void {
    anchor.selectAll('.' + className)
      .data([values])
      .enter().append('text')
      .attr('class', 'waveChart__text ' +  className)
      .attr('dy', positionY)
      .append('textPath')
      .attr('startOffset', '45%')
      .attr('text-anchor', 'middle')
      .attr('xlink:href', '#' + id)
      .attr('opacity', opacity)
      .text((d: any) => {
        console.log(d); return d[0] + 'km';
      });
  }

  private waveChart(data, constraints: ChartConstraints) {
    let r = 100;
    let width = 15;
    let outlineWidth = 2;
    let margin = 2;
    let vis = d3.select('#wave').append('svg')
      .attr('width', constraints.width)
      .attr('height', constraints.height);

    this.drawDivider(vis, ((r * 2) + (constraints.padding * 2)), {x: 0, y: r}, '#E6E6E6');


    // DRAW SINGLE RUN TYPE ARCS
    for (let i = 0; i < data.length; i++) {
      vis = vis
        .data([data[i]])
        .append('g');

      if (i === 0) {
        vis.attr('transform', 'translate(' + (r + constraints.padding) + ',' + r + ')');
      } else if (i === 1) {
        r -= outlineWidth;
        r -= margin;
      } else {
        r -= width;
        r -= margin;
      }

      let arc: any;

      if (i === 0) {
        arc = this.setupArc(r, outlineWidth);
      } else {
        arc = this.setupArc(r, width);
      }

      let upperPie = this.setupPie(-0.5, 0.5);
      let lowerPie = this.setupPie(1.5, 0.5);


      // SETUP ARCS
      let upperArcs = this.drawArc(vis, upperPie(data[i][0].values.upper), 'upperSlice');
      let lowerArcs = this.drawArc(vis, lowerPie(data[i][0].values.lower), 'lowerSlice');


      // DRAW ARCS
      let upperArcID = this.colorArc(upperArcs, arc, getCategoryColor(data[i][0].label), 1, i, true);
      let lowerArcID = this.colorArc(lowerArcs, arc, getCategoryColor(data[i][0].label), 0.5, i, false);

      if (i === 0) {
        this.drawArcText(vis, data[i][0].values.upper, upperArcID, 'waveChart__text--upper', -3, 1);
        this.drawArcText(vis, data[i][0].values.lower, lowerArcID, 'waveChart__text--lower', 14, 0.5);
      }
    }
  }
}
