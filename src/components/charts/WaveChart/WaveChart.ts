import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {CategoryOpacity, ChartConstraints} from '../../../models/VisualVariableModel';
import * as d3 from 'd3';
import {RunType} from '../../../store/state';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {ActivityClusterModel} from '../../../models/Activity/ActivityClusterModel';
import {getLargerValue} from '../../../utils/numbers/numbers';
import {formatDistance} from '../../../utils/format-data';
import {FormatDistanceType} from '../../../models/FormatModel';

class WaveChartValues {
  upper: number[];
  lower: number[];

  constructor() {
    this.upper = [];
    this.lower = [];
  }
}

class WaveChartStructure {
  label: RunType;
  values: WaveChartValues;

  constructor() {
    this.label = null;
    this.values = new WaveChartValues();
  }

  public checkValues(): boolean {
    return (this.values.lower[0] !== 0 || this.values.upper[0] !== 0);
  }
}
@Component({
  template: require('./waveChart.html'),
})
export class WaveChart extends Vue {
  @Prop()
  loadingStatus: LoadingStatus;

  @Watch('data')
  @Watch('loadingStatus.activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.data = this.$store.getters.getActivitiesFromLastTwoWeeks;
      this.waveChart(this.formatData(this.data), this.chartConstraints);
    }
  }

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.data = this.$store.getters.getActivitiesFromLastTwoWeeks;
      this.waveChart(this.formatData(this.data), this.chartConstraints);
    }
  }

  private data: ActivityClusterModel[];

  private chartConstraints = new ChartConstraints(20, 500, 500);

  private getHiddenValues(max: number, value: number): number {
    return max - value;
  }

  private formatData(data: ActivityClusterModel[]): any {
    let maxDistance = 0;
    let total = new WaveChartStructure();
    let run = new WaveChartStructure();
    let longRun = new WaveChartStructure();
    let shortIntervals = new WaveChartStructure();
    let competition = new WaveChartStructure();
    let uncategorized = new WaveChartStructure();

    data.forEach((cluster: ActivityClusterModel) => {
      maxDistance = getLargerValue(cluster.stats.distance, maxDistance);
    });

    data.forEach((cluster: ActivityClusterModel, i: number) => {
      total.label = RunType.All;
      run.label = RunType.Run;
      longRun.label = RunType.LongRun;
      shortIntervals.label = RunType.ShortIntervals;
      competition.label = RunType.Competition;
      uncategorized.label = RunType.Uncategorized;

      let key = 'upper';
      if (i !== 0) {
        key = 'lower';
      }

      total.values[key].push(cluster.stats.distance);
      total.values[key].push(this.getHiddenValues(maxDistance, cluster.stats.distance));


      run.values[key].push(cluster.stats.typeCount.run.distance);
      run.values[key].push(this.getHiddenValues(maxDistance, cluster.stats.typeCount.run.distance));

      longRun.values[key].push(cluster.stats.typeCount.longRun.distance);
      longRun.values[key].push(this.getHiddenValues(maxDistance, cluster.stats.typeCount.longRun.distance));

      shortIntervals.values[key].push(cluster.stats.typeCount.interval.distance);
      shortIntervals.values[key].push(this.getHiddenValues(maxDistance, cluster.stats.typeCount.interval.distance));

      competition.values[key].push(cluster.stats.typeCount.competition.distance);
      competition.values[key].push(this.getHiddenValues(maxDistance, cluster.stats.typeCount.competition.distance));

      uncategorized.values[key].push(cluster.stats.typeCount.uncategorized.distance);
      uncategorized.values[key].push(this.getHiddenValues(maxDistance, cluster.stats.typeCount.uncategorized.distance));
    });

    let returnArr = [];

    if (total.checkValues()) {
      returnArr.push([total]);
    }
    if (run.checkValues()) {
      returnArr.push([run]);
    }
    if (longRun.checkValues()) {
      returnArr.push([longRun]);
    }
    if (shortIntervals.checkValues()) {
      returnArr.push([shortIntervals]);
    }
    if (competition.checkValues()) {
      returnArr.push([competition]);
    }
    if (uncategorized.checkValues()) {
      returnArr.push([uncategorized]);
    }

    return returnArr;
  }

  /**
   *
   * @param anchor
   * @param {number} width
   * @param position
   * @param {string} color
   */
  private drawDivider(anchor: any, width: number, position, color: string): void {
    anchor.append('rect')
      .attr('x', position.x)
      .attr('y', position.y)
      .attr('height', 1)
      .attr('width', width)
      .attr('fill', color);
  }

  /**
   *
   * @param {number} start
   * @param {number} end
   * @returns {any}
   */
  private setupPie(start: number, end: number): any {
    return d3.pie()
      .sort(null)
      .startAngle(Math.PI * start)
      .endAngle(Math.PI * end)
      .value((d: any) => {
          return d;
        });
  }

  /**
   *
   * @param {number} radius
   * @param {number} width
   * @returns {any}
   */
  private setupArc(radius: number, width: number): any {
    return d3.arc()
      .outerRadius(radius)
      .innerRadius(radius - width);
  }

  /**
   *
   * @param anchor
   * @param {number[]} values
   * @param {string} className
   * @returns {any}
   */
  private drawArc(anchor: any, values: number[], className: string): any {
    return anchor.selectAll('g.' + className)
      .data(values)
      .enter()
      .append('g')
      .attr('class', className);
  }

  /**
   *
   * @param anchor
   * @param arc
   * @param {string} color
   * @param {number} opacity
   * @param {number} index
   * @param {boolean} upper
   * @returns {any}
   */
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

  /**
   *
   * @param anchor
   * @param values
   * @param {string} id
   * @param {string} className
   * @param {number} positionY
   * @param {number} opacity
   */
  private drawArcText(anchor: any, values: any, id: string, className: string, positionY: number, opacity: number, offset: string, align: string): void {
    anchor.selectAll('.' + className)
      .data([values])
      .enter().append('text')
      .attr('class', 'waveChart__text ' +  className)
      .attr('dy', positionY)
      .append('textPath')
      .attr('startOffset', offset)
      .attr('text-anchor', align)
      .attr('xlink:href', '#' + id)
      .attr('opacity', opacity)
      .text((d: any) => {
        if (d[0] === 0) {
          return '';
        } else {
          return formatDistance(d[0], FormatDistanceType.Kilometers).toFixed(1) + 'km';
        }
      });
  }

  /**
   *
   * @param data
   * @param {ChartConstraints} constraints
   */
  private waveChart(data, constraints: ChartConstraints): void {
    let r = 100;
    let width = 15;
    let outlineWidth = 2;
    let margin = 2;

    d3.select('#wave' + ' > svg').remove();


    // INIT SVG
    let vis = d3.select('#wave').append('svg')
      .attr('width', constraints.width)
      .attr('height', constraints.height);


    // ADD DIVIDER
    this.drawDivider(vis, ((r * 2) + (constraints.padding * 2)), {x: 0, y: r + constraints.padding}, '#E6E6E6');


    // DRAW SINGLE RUN TYPE ARCS
    for (let i = 0; i < data.length; i++) {
      vis = vis
        .data([data[i]])
        .append('g');


      // CALCULATE POSITION
      if (i === 0) {
        vis.attr('transform', 'translate(' + (r + constraints.padding) + ',' + (r + constraints.padding) + ')');
      } else if (i === 1) {
        r -= outlineWidth;
        r -= margin;
      } else {
        r -= width;
        r -= margin;
      }


      // SETUP ARC
      let arc: any;
      if (i === 0) {
        arc = this.setupArc(r, outlineWidth);
      } else {
        arc = this.setupArc(r, width);
      }


      // SETUP PIE
      let upperPie = this.setupPie(-0.5, 0.5);
      let lowerPie = this.setupPie(1.5, 0.5);


      // DRAW ARCS
      let upperArcs = this.drawArc(vis, upperPie(data[i][0].values.upper), 'upperSlice');
      let lowerArcs = this.drawArc(vis, lowerPie(data[i][0].values.lower), 'lowerSlice');


      // COLOR ARCS
      let upperArcID = this.colorArc(upperArcs, arc, getCategoryColor(data[i][0].label), CategoryOpacity.Active, i, true);
      let lowerArcID = this.colorArc(lowerArcs, arc, getCategoryColor(data[i][0].label), CategoryOpacity.Inactive, i, false);


      // ADD LABELS TO ARCS
      if (i === 0) {
        this.drawArcText(vis, data[i][0].values.upper, upperArcID, 'waveChart__text--upper', -3, CategoryOpacity.Active, '45%', 'middle');
        this.drawArcText(vis, data[i][0].values.lower, lowerArcID, 'waveChart__text--lower', 14, 0.5, '45%', 'middle');
      } else {
        this.drawArcText(vis, data[i][0].values.upper, upperArcID, 'waveChart__text--small waveChart__text--upper--small', 12, CategoryOpacity.Active, '5px', 'left');
        this.drawArcText(vis, data[i][0].values.lower, lowerArcID, 'waveChart__text--small waveChart__text--lower--small', -3, 0.5, '5px', 'left');
      }
    }
  }
}
