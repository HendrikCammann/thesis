import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {ChartConstraints} from '../../../models/VisualVariableModel';
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


  private chartConstraints = new ChartConstraints(0, 500, 500);

  private setupPie(start: number, end: number): any {
    return d3.pie()
      .sort(null)
      .startAngle(Math.PI * start)
      .endAngle(Math.PI * end)
      .value((d: any) => {
          return d;
        });
  }

  private setupArc(anchor: any, values: number[], className: string) {
    return anchor.selectAll('g.' + className)
      .data(values)
      .enter()
      .append('g')
      .attr('class', className);
  }

  private drawArc(anchor: any, arc: any, color: string, opacity: number) {
    return anchor.append('path')
      .attr('fill', color)
      .attr('opacity', (d: any, i: any) => {
        if (i === 1) {
          return 0;
        } else {
          return opacity;
        }
      })
      .attr('d', arc);
  }

  private waveChart(data, constraints: ChartConstraints) {
    let w = constraints.width, h = constraints.height, r = 100;
    let vis = d3.select('#wave').append('svg').attr('width', w)
      .attr('height', h);

    // DRAW SINGLE RUN TYPE ARCS
    for (let i = 0; i < data.length; i++) {
      vis = vis
        .data([data[i]])
        .append('g');

      if (i === 0) {
        vis.attr('transform', 'translate(' + r + ',' + r + ')');
      } else {
        r -= 20;
        r -= 1;
      }

      let arc: any = d3.arc()
        .outerRadius(r)
        .innerRadius(r - 20);

      let upperPie = this.setupPie(-0.5, 0.5);
      let lowerPie = this.setupPie(1.5, 0.5);


      // SETUP ARCS
      let upperArcs = this.setupArc(vis, upperPie(data[i][0].values.upper), 'upperSlice');
      let lowerArcs = this.setupArc(vis, lowerPie(data[i][0].values.lower), 'lowerSlice');


      // DRAW ARCS
      upperArcs = this.drawArc(upperArcs, arc, getCategoryColor(data[i][0].label), 1);
      lowerArcs = this.drawArc(lowerArcs, arc, getCategoryColor(data[i][0].label), 0.5);
    }
  }

}
