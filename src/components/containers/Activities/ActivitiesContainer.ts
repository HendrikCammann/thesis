import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {BubbleChart} from '../../charts/BubbleChart';
import {mapGetters} from 'vuex';
import {ActivityListItem} from '../../modules/ActivityListItem';
import {SwooshChart} from '../../charts/SwooshChart';
import {ArcChart} from '../../charts/ArcChart';
import {CanvasConstraints} from '../../../models/VisualVariableModel';
import {filterBus} from '../../../main';
import {filterEvents} from '../../../events/filter';
import {loadingStatus} from '../../../models/App/AppStatus';
import {FilterModule} from '../../modules/FilterModule';
import {ClusterType, RunType} from '../../../store/state';
import {SliderModule} from '../../modules/SliderModule';

@Component({
  template: require('./activities.html'),
  computed: mapGetters({
    activities: 'getActivities',
    sortedLists: 'getSortedLists',
    clusters: 'getClusters',
    loadingStatus: 'getAppLoadingStatus',
    filter: 'getFilter',
  }),
  components: {
    'bubbleChart': BubbleChart,
    'swooshChart': SwooshChart,
    'arcChart': ArcChart,
    'activityListItem': ActivityListItem,
    'filterModule': FilterModule,
    'sliderModule': SliderModule,
  }
})
export class ActivitiesContainer extends Vue {
  public canvasConstraints = new CanvasConstraints(15, 1200, 800, 300, 1, 20);

  public runTypeFilters = [
    {
      name: 'All',
      type: RunType.All,
    },
    {
      name: 'Run',
      type: RunType.Run,
    },
    {
      name: 'Long Run',
      type: RunType.LongRun,
    },
    {
      name: 'Short Intervals',
      type: RunType.ShortIntervals,
    },
    {
      name: 'Competition',
      type: RunType.Competition,
    },
    {
      name: 'Uncategorized',
      type: RunType.Uncategorized,
    },
  ];

  public timeGrouping = [
    {
      name: 'Year',
      type: ClusterType.ByYears,
    },
    {
      name: 'Month',
      type: ClusterType.ByMonths,
    },
    {
      name: 'Week',
      type: ClusterType.ByWeeks,
    }
  ];

  mounted() {
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
