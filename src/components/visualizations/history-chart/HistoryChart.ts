import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {DashboardViewType, DisplayType, RunType} from '../../../store/state';
import {setupSvg} from '../../../utils/svgInit/svgInit';
import {getKeys} from '../../../utils/array-helper';
import {getLargerValue} from '../../../utils/numbers/numbers';
import {ActivityClusterModel} from '../../../models/Activity/ActivityClusterModel';
import {CategoryOpacity, ChartConstraints} from '../../../models/VisualVariableModel';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';

class HistoryChartValues {
  upper: number[];
  lower: number[];

  constructor() {
    this.upper = [];
    this.lower = [];
  }
}

class HistoryChartStructure {
  label: RunType;
  values: HistoryChartValues;

  constructor() {
    this.label = null;
    this.values = new HistoryChartValues();
  }

  public checkValues(): boolean {
    return (this.values.lower[0] !== 0 || this.values.upper[0] !== 0);
  }
}
@Component({
  template: require('./historyChart.html'),
})
export class HistoryChart extends Vue {
  @Prop()
  loadingStatus: LoadingStatus;

  @Prop()
  data: any;

  @Prop()
  viewType: DashboardViewType;

  @Prop()
  currentPreparation: string;

  private displayType = DisplayType.Distance;
  private width = 345;
  private height = 345;
  private chartConstraints = new ChartConstraints(0, this.height, this.width);

  @Watch('data')
  @Watch('viewType')
  @Watch('loadingStatus.activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      let data = null;
      switch (this.viewType) {
        case DashboardViewType.Day:
          break;
        case DashboardViewType.Week:
          let keys = getKeys(this.data['All'].byWeeks);
          data = this.initData([this.data['All'].byWeeks[keys[0]], this.data['All'].byWeeks[keys[1]]], this.viewType, this.displayType);
          break;
        case DashboardViewType.Month:
          let keysM = getKeys(this.data['All'].byMonths);
          data = this.initData([this.data['All'].byMonths[keysM[0]], this.data['All'].byMonths[keysM[1]]], this.viewType, this.displayType);
          break;
        case DashboardViewType.Preparation:
          // this.stats = this.initData(this.data[this.currentPreparation].unsorted.all, this.viewType);
          break;
      }
      this.historyChart(data, this.chartConstraints);
    }
  }

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
    }
  }

  private initData(data, viewType, displayType) {
    let maxValue = 0;
    let accessor = '';
    switch (displayType) {
      case DisplayType.Distance:
        accessor = 'distance';
        break;
      case DisplayType.Duration:
        accessor = 'duration';
        break;
      case DisplayType.Intensity:
        accessor = 'intensity';
        break;
    }

    let total = new HistoryChartStructure();
    let run = new HistoryChartStructure();
    let longRun = new HistoryChartStructure();
    let shortIntervals = new HistoryChartStructure();
    let competition = new HistoryChartStructure();
    let uncategorized = new HistoryChartStructure();

    data.forEach((cluster: ActivityClusterModel) => {
      maxValue = getLargerValue(cluster.stats[accessor], maxValue);
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

      total.values[key].push(cluster.stats[accessor]);
      total.values[key].push(this.getHiddenValues(maxValue, cluster.stats[accessor]));


      run.values[key].push(cluster.stats.typeCount.run[accessor]);
      run.values[key].push(this.getHiddenValues(maxValue, cluster.stats.typeCount.run[accessor]));

      longRun.values[key].push(cluster.stats.typeCount.longRun[accessor]);
      longRun.values[key].push(this.getHiddenValues(maxValue, cluster.stats.typeCount.longRun[accessor]));

      shortIntervals.values[key].push(cluster.stats.typeCount.interval[accessor]);
      shortIntervals.values[key].push(this.getHiddenValues(maxValue, cluster.stats.typeCount.interval[accessor]));

      competition.values[key].push(cluster.stats.typeCount.competition[accessor]);
      competition.values[key].push(this.getHiddenValues(maxValue, cluster.stats.typeCount.competition[accessor]));

      uncategorized.values[key].push(cluster.stats.typeCount.uncategorized[accessor]);
      uncategorized.values[key].push(this.getHiddenValues(maxValue, cluster.stats.typeCount.uncategorized[accessor]));
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

  private getHiddenValues(max: number, value: number): number {
    return max - value;
  }

  private historyChart(data, constraints: ChartConstraints): void {
    let r = this.width / 2;
    let width = 28;
    let outlineWidth = 2;
    let margin = 4;

    d3.select('#history' + ' > svg').remove();


    // INIT SVG
    let vis = d3.select('#history').append('svg')
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
      let upperArcID = this.colorArc(upperArcs, arc, getCategoryColor(data[i][0].label), CategoryOpacity.Full, i, true);
      let lowerArcID = this.colorArc(lowerArcs, arc, getCategoryColor(data[i][0].label), 0.5, i, false);


      // ADD LABELS TO ARCS
    }
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

  private drawArc(anchor: any, values: number[], className: string): any {
    return anchor.selectAll('g.' + className)
      .data(values)
      .enter()
      .append('g')
      .attr('class', className);
  }

  private setupArc(radius: number, width: number): any {
    return d3.arc()
      .outerRadius(radius)
      .innerRadius(radius - width);
  }

  private setupPie(start: number, end: number): any {
    return d3.pie()
      .sort(null)
      .startAngle(Math.PI * start)
      .endAngle(Math.PI * end)
      .value((d: any) => {
        return d;
      });
  }

  private drawDivider(anchor: any, width: number, position, color: string): void {
    anchor.append('rect')
      .attr('x', position.x)
      .attr('y', position.y)
      .attr('height', 1)
      .attr('width', width)
      .attr('fill', color);
  }
}
