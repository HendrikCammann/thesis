/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {MutationTypes} from '../../../store/mutation-types';
import {ClusterType, RunType} from '../../../store/state';
import {ClusterItem} from '../../../models/State/StateModel';
import {TimeRangeModel} from '../../../models/Filter/FilterModel';

@Component({
  template: require('./filterModule.html'),
})
export class FilterModule extends Vue {
  @Prop()
  timeRange: any;

  @Prop()
  clusters: ClusterItem[];

  public selectedTrainingCluster: string = 'All';

  public selectRunType(event) {
    let runType: RunType;
    switch (event.target.id) {
      case 'allActivities':
        runType = RunType.All;
        break;
      case 'run':
        runType = RunType.Run;
        break;
      case 'tempo-run':
        runType = RunType.TempoRun;
        break;
      case 'long-run':
        runType = RunType.LongRun;
        break;
      case 'short-intervals':
        runType = RunType.ShortIntervals;
        break;
      case 'long-intervals':
        runType = RunType.LongIntervals;
        break;
      case 'competition':
        runType = RunType.Competition;
        break;
      case 'regeneration':
        runType = RunType.Regeneration;
        break;
    }
    this.$store.dispatch(MutationTypes.SET_SELECTED_RUNTYPE, runType);
  }

  public selectCluster(event) {
    let clusterType: ClusterType;
    switch (event.target.id) {
      case 'year':
        clusterType = ClusterType.ByYears;
        break;
      case 'month':
        clusterType = ClusterType.ByMonths;
        break;
      case 'week':
        clusterType = ClusterType.ByWeeks;
        break;
      case 'all':
        clusterType = ClusterType.All;
        break;
    }
    this.$store.dispatch(MutationTypes.SET_SELECTED_CLUSTER, clusterType);
  }

  public selectYear(event) {
    this.$store.dispatch(MutationTypes.SET_FILTERBY_TYPE, this.selectedTrainingCluster);
  }

  public setDateRange(event) {
    let timeRangeUpdate = new TimeRangeModel();
    timeRangeUpdate.start = new Date(this.timeRange.start);
    timeRangeUpdate.end = new Date(this.timeRange.end);
    timeRangeUpdate.isRange = true;
    this.$store.dispatch(MutationTypes.SET_TIME_RANGE, timeRangeUpdate);
  }

  onPropertyChanged(val: any, oldVal: any) {

  }
}
