import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {DashboardViewType, DisplayType} from '../../../store/state';
import {setupSvg} from '../../../utils/svgInit/svgInit';
import {getKeys} from '../../../utils/array-helper';
import {getLargerValue} from '../../../utils/numbers/numbers';


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

  @Watch('data')
  @Watch('viewType')
  @Watch('loadingStatus.activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      let svg = setupSvg('#history', this.width, this.height);
      let data = null;
      switch (this.viewType) {
        case DashboardViewType.Day:
          break;
        case DashboardViewType.Week:
          let keys = getKeys(this.data['All'].byWeeks);
          data = this.initData(this.data['All'].byWeeks[keys[0]], this.data['All'].byWeeks[keys[1]], this.viewType, this.displayType);
          break;
        case DashboardViewType.Month:
          let keysM = getKeys(this.data['All'].byMonths);
          data = this.initData(this.data['All'].byMonths[keysM[0]], this.data['All'].byMonths[keysM[1]], this.viewType, this.displayType);
          break;
        case DashboardViewType.Preparation:
          // this.stats = this.initData(this.data[this.currentPreparation].unsorted.all, this.viewType);
          break;
      }
      this.drawHistoryChart(svg, data);
    }
  }

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
    }
  }

  private initData(actData, lastData, viewType, displayType) {
    let maxVal = 0;
    let accessor = '';
    switch (displayType) {
      case DisplayType.Distance:
        maxVal = getLargerValue(actData.stats.distance, lastData.stats.distance);
        accessor = 'distance';
        break;
      case DisplayType.Duration:
        maxVal = getLargerValue(actData.stats.time, lastData.stats.time);
        accessor = 'duration';
        break;
      case DisplayType.Intensity:
        maxVal = getLargerValue(actData.stats.intensity, lastData.stats.intensity);
        accessor = 'intensity';
        break;
    }

    // ActData Format
    // actData.stats.typeCount.
    let upperArc = {
      competition: [actData.stats.typeCount.competition[accessor], maxVal - actData.stats.typeCount.competition[accessor]],
      interval: [actData.stats.typeCount.interval[accessor], maxVal - actData.stats.typeCount.interval[accessor]],
      longRun: [actData.stats.typeCount.longRun[accessor], maxVal - actData.stats.typeCount.longRun[accessor]],
      run: [actData.stats.typeCount.run[accessor], maxVal - actData.stats.typeCount.run[accessor]],
      uncategorized: [actData.stats.typeCount.uncategorized[accessor], maxVal - actData.stats.typeCount.uncategorized[accessor]],
    };

    // LastData Format;
    let lowerArc = {
      competition: [lastData.stats.typeCount.competition[accessor], maxVal - lastData.stats.typeCount.competition[accessor]],
      interval: [lastData.stats.typeCount.interval[accessor], maxVal - lastData.stats.typeCount.interval[accessor]],
      longRun: [lastData.stats.typeCount.longRun[accessor], maxVal - lastData.stats.typeCount.longRun[accessor]],
      run: [lastData.stats.typeCount.run[accessor], maxVal - lastData.stats.typeCount.run[accessor]],
      uncategorized: [lastData.stats.typeCount.uncategorized[accessor], maxVal - lastData.stats.typeCount.uncategorized[accessor]],
    };

    return {
      upper: upperArc,
      lower: lowerArc,
    };
  }

  private drawHistoryChart(svg, data) {
    let r = 100;
    let width = 15;
    let outlineWidth = 2;
    let margin = 2;

    svg = svg
      .data([data.upper])
        .append('g');

    let arc = d3.arc().outerRadius(r);

    let keys = getKeys(data.upper);
    keys.forEach(key => {
      console.log(data.upper[key]);
      let arc = d3.arc().outerRadius(r);

      // let pie =

    });

    console.log(data);
  }
}
