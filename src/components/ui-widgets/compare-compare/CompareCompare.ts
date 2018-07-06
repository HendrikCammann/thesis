/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {ClusterItem} from '../../../models/State/StateModel';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {DisplayType} from '../../../store/state';
import {getKeys} from '../../../utils/array-helper';
import {getLargerValue, getPercentageFromValue} from '../../../utils/numbers/numbers';
import {formatDistance} from '../../../utils/format-data';
import {FormatDistanceType, FormatDurationType} from '../../../models/FormatModel';
import {formatSecondsToDuration} from '../../../utils/time/time-formatter';
import {CompareChart} from '../../visualizations/compare-chart';
import {Divider} from '../../ui-elements/divider';

@Component({
  template: require('./compareCompare.html'),
  components: {
    'compareChart': CompareChart,
    'divider': Divider,
  }
})
export class CompareCompare extends Vue {
  @Prop()
  clusters: any[];

  @Prop()
  clusterData: ClusterItem[];

  @Prop()
  loadingStatus: LoadingStatus;

  @Prop()
  displayType: DisplayType;

  public data = null;

  @Watch('clusters')
  @Watch('displayType')
  @Watch('selectedClusters')
  @Watch('loaded.activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.data = this.initData(this.clusters, this.displayType);
    }
  }

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.data = this.initData(this.clusters, this.displayType);
    }
  }

  private setAccessor(displayType) {
    switch(displayType) {
      case DisplayType.Distance:
        return 'distance';
      case DisplayType.Duration:
        return 'duration';
      case DisplayType.Intensity:
        return 'intensity'
    }
  }

  private getMaximum(clusters, displayType): number {
    let maxValue = 0;
    let accessor = this.setAccessor(displayType);

    clusters.forEach(cluster => {
      let keys = getKeys(cluster.data.stats.typeCount);
      keys.forEach(key => {
        maxValue = getLargerValue(cluster.data.stats.typeCount[key][accessor], maxValue);
      });
    });

    return maxValue;
  }

  private formatValue(displayType, value) {
    switch(displayType) {
      case DisplayType.Distance:
        return formatDistance(value, FormatDistanceType.Kilometers).toFixed(0) + 'km';
      case DisplayType.Duration:
        return formatSecondsToDuration(value, FormatDurationType.Dynamic).all;
      case DisplayType.Intensity:
        return Math.round(value);
    }
  }

  private sortRunTypes(clusters, displayType, maxValue) {
    let accessor = this.setAccessor(displayType);

    let returnArr = [];
    clusters.forEach(cluster => {
      let arr = [];
      let accessor2 = accessor;
      if (accessor2 === 'duration') {
        accessor2 = 'time';
      }

      let competition = {
        value: cluster.data.stats.typeCount.competition[accessor],
        formatted: this.formatValue(displayType, cluster.data.stats.typeCount.competition[accessor]),
        percentage: getPercentageFromValue(cluster.data.stats.typeCount.competition[accessor], maxValue) / 100,
        percentageIntern: getPercentageFromValue(cluster.data.stats.typeCount.competition[accessor], cluster.data.stats[accessor2]) + '%',
        type: cluster.data.stats.typeCount.competition.type,
      };
      let interval = {
        value: cluster.data.stats.typeCount.interval[accessor],
        formatted: this.formatValue(displayType, cluster.data.stats.typeCount.interval[accessor]),
        percentage: getPercentageFromValue(cluster.data.stats.typeCount.interval[accessor], maxValue) / 100,
        percentageIntern: getPercentageFromValue(cluster.data.stats.typeCount.interval[accessor], cluster.data.stats[accessor2]) + '%',
        type: cluster.data.stats.typeCount.interval.type,
      };
      let longRun = {
        value: cluster.data.stats.typeCount.longRun[accessor],
        formatted: this.formatValue(displayType, cluster.data.stats.typeCount.longRun[accessor]),
        percentage: getPercentageFromValue(cluster.data.stats.typeCount.longRun[accessor], maxValue) / 100,
        percentageIntern: getPercentageFromValue(cluster.data.stats.typeCount.longRun[accessor], cluster.data.stats[accessor2]) + '%',
        type: cluster.data.stats.typeCount.longRun.type,
      };
      let run = {
        value: cluster.data.stats.typeCount.run[accessor],
        formatted: this.formatValue(displayType, cluster.data.stats.typeCount.run[accessor]),
        percentage: getPercentageFromValue(cluster.data.stats.typeCount.run[accessor], maxValue) / 100,
        percentageIntern: getPercentageFromValue(cluster.data.stats.typeCount.run[accessor], cluster.data.stats[accessor2]) + '%',
        type: cluster.data.stats.typeCount.run.type,
      };
      let uncategorized = {
        value: cluster.data.stats.typeCount.uncategorized[accessor],
        formatted: this.formatValue(displayType, cluster.data.stats.typeCount.uncategorized[accessor]),
        percentage: getPercentageFromValue(cluster.data.stats.typeCount.uncategorized[accessor], maxValue) / 100,
        percentageIntern: getPercentageFromValue(cluster.data.stats.typeCount.uncategorized[accessor], cluster.data.stats[accessor2]) + '%',
        type: cluster.data.stats.typeCount.uncategorized.type,
      };

      arr.push(run);
      arr.push(longRun);
      arr.push(interval);
      arr.push(competition);
      arr.push(uncategorized);

      returnArr.push(arr);
    });

    return returnArr;
  }

  private initData(clusters, displayType) {
    let maxValue = this.getMaximum(clusters, displayType);
    let sortedData = this.sortRunTypes(clusters, displayType, maxValue);
    return {
      max: maxValue,
      data: sortedData,
      type: displayType,
    }
  }
}
