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

  public timeRangeFilter = {
    start: '',
    end: ''
  };

  public canvasConstraints = new CanvasConstraints(15, 1200, 800, 300, 1, 20);

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

    filterBus.$on(filterEvents.set_Training_Cluster, (type) => {
      this.$store.dispatch(MutationTypes.SET_FILTERBY_TYPE, type);
    });

    filterBus.$on(filterEvents.set_Time_Grouping, (type) => {
      this.$store.dispatch(MutationTypes.SET_SELECTED_CLUSTER, type);
    });

    filterBus.$on(filterEvents.set_Run_Type, (type) => {
      this.$store.dispatch(MutationTypes.SET_SELECTED_RUNTYPE, type);
    });
  }
}
