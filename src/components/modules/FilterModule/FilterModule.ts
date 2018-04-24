/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {MutationTypes} from '../../../store/mutation-types';
import {ClusterType, RunType} from '../../../store/state';
import {ClusterItem} from '../../../models/State/StateModel';
import {FilterModel, TimeRangeModel} from '../../../models/Filter/FilterModel';
import {filterBus} from '../../../main';
import {filterEvents} from '../../../events/filter';
import {FilterButton} from '../../partials/FilterButton';
import {TimeGroupingButton} from '../../partials/TimeGroupingButton';

@Component({
  template: require('./filterModule.html'),
  components: {
    'filterButton': FilterButton,
    'timegroupingButton': TimeGroupingButton,
  }
})
export class FilterModule extends Vue {
  @Prop()
  filter: FilterModel;

  @Prop()
  clusters: ClusterItem[];

  @Prop()
  filterOptions: any[];

  @Prop()
  timeGroupOptions: any[];

  @Watch('filter.timeRange.start')
  @Watch('filter.timeRange.end')
  onPropertyChanged(val: any, oldVal: any) {
    this.setTimeRange();
  }

  public timeRange = {
    start: '',
    end: ''
  };

  public getActiveFilterElement(activeFilter, itemFilter): boolean {
    return activeFilter === itemFilter;
  }

  public selectedTrainingCluster: string = 'All';

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

  private setTimeRange(): void {
    this.timeRange.start = this.filter.timeRange.start.toISOString().split('T')[0];
    this.timeRange.end = this.filter.timeRange.end.toISOString().split('T')[0];
  }

  mounted() {
    this.setTimeRange();

    filterBus.$on(filterEvents.selected_Run_Type, (type) => {
      filterBus.$emit(filterEvents.set_Run_Type, type);
    });

    filterBus.$on(filterEvents.selected_Time_Group, (type) => {
      filterBus.$emit(filterEvents.set_Time_Grouping, type)
    });
  }
}
