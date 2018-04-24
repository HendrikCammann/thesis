/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {MutationTypes} from '../../../store/mutation-types';
import {ClusterType, RunType} from '../../../store/state';
import {ClusterItem} from '../../../models/State/StateModel';
import {TimeRangeModel} from '../../../models/Filter/FilterModel';
import {filterBus} from '../../../main';
import {filterEvents} from '../../../events/filter';

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
    filterBus.$emit(filterEvents.set_Run_Type, runType);
  }

  public selectTimeGrouping(event) {
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
    filterBus.$emit(filterEvents.set_Time_Grouping, clusterType)
  }

  public selectTrainingCluster() {
    filterBus.$emit(filterEvents.set_Training_Cluster, this.selectedTrainingCluster);
  }

  public setDateRange() {
    let timeRangeUpdate = new TimeRangeModel();
    timeRangeUpdate.start = new Date(this.timeRange.start);
    timeRangeUpdate.end = new Date(this.timeRange.end);
    timeRangeUpdate.isRange = true;
    this.$store.dispatch(MutationTypes.SET_TIME_RANGE, timeRangeUpdate);
  }

  onPropertyChanged(val: any, oldVal: any) {

  }
}
