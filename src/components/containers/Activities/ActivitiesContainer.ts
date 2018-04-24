import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {ClusterType, RunType, State} from '../../../store/state';
import {BubbleChart} from '../../modules/BubbleChart';
import {mapGetters} from 'vuex';
import {ActivityListItem} from '../../modules/ActivityListItem';
import {SwooshChart} from '../../modules/SwooshChart';
import {ArcChart} from '../../modules/ArcChart';
import {CanvasConstraints} from '../../../models/VisualVariableModel';
import {filterBus} from '../../../main';
import {filterEvents} from '../../../events/filter';
import {TimeRangeModel} from '../../../models/Filter/FilterModel';
import {loadingStatus} from '../../../models/App/AppStatus';
import {Watch} from 'vue-property-decorator';
import {FilterModule} from '../../modules/FilterModule';
// import {ClusterChart} from '../../modules/ClusterChart';

@Component({
  template: require('./activities.html'),
  computed: mapGetters({
    activities: 'getActivities',
    sortedLists: 'getSortedLists',
    clusters: 'getClusters',
    loadingStatus: 'getAppLoadingStatus',
    filter: 'getFilter',
    selectedRunType: 'getSelectedRunType',
    selectedCluster: 'getSelectedClusterType'
  }),
  components: {
    'bubbleChart': BubbleChart,
    'swooshChart': SwooshChart,
    'arcChart': ArcChart,
    'activityListItem': ActivityListItem,
    'filterModule': FilterModule,
  }
})
export class ActivitiesContainer extends Vue {

  public filterCluster: string = 'All';

  public timeRangeFilter = {
    start: '',
    end: ''
  };

  public startInput: any = '';
  public endInput: any = '';

  public canvasConstraints = new CanvasConstraints(15, 1200, 800, 300, 1, 20);

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
    this.$store.dispatch(MutationTypes.SET_FILTERBY_TYPE, this.filterCluster);
  }

  public setDateRange(event) {
    let timeRange = new TimeRangeModel();
    if (this.timeRangeFilter.start === '') {
      timeRange.start = new Date(1970);
    } else {
      timeRange.start = new Date(this.startInput);
    }

    if (this.timeRangeFilter.end === '') {
      timeRange.end = new Date(new Date());
    } else {
      timeRange.end = new Date(this.endInput);
    }

    timeRange.isRange = true;
    this.$store.dispatch(MutationTypes.SET_TIME_RANGE, timeRange);
  }

  mounted() {
    this.timeRangeFilter.start = this.$store.getters.getTimeRange.start.toISOString().split('T')[0];
    this.timeRangeFilter.end = this.$store.getters.getTimeRange.end.toISOString().split('T')[0];

    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }

    filterBus.$on(filterEvents.setRunTypeFilter, (type) => {
      this.$store.dispatch(MutationTypes.SET_SELECTED_RUNTYPE, type);
    });
  }
}
