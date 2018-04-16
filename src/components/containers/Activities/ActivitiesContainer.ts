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
// import {ClusterChart} from '../../modules/ClusterChart';

@Component({
  template: require('./activities.html'),
  computed: mapGetters({
    activities: 'getActivities',
    sortedActivities: 'getSortedActivities',
    filter: 'getFilter',
    selectedRunType: 'getSelectedRunType',
    selectedCluster: 'getSelectedClusterType'
  }),
  components: {
    'bubbleChart': BubbleChart,
    'swooshChart': SwooshChart,
    'arcChart': ArcChart,
    'activityListItem': ActivityListItem
  }
})
export class ActivitiesContainer extends Vue {

  public filterYear: string = 'all';

  public canvasConstraints = new CanvasConstraints(15, 1200, 800, 300, 1);

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
    this.$store.dispatch(MutationTypes.SET_FILTERBY_TYPE, this.filterYear);
  }

  mounted() {
    this.$store.dispatch(MutationTypes.GET_ACTIVITIES);

    filterBus.$on(filterEvents.setRunTypeFilter, (type) => {
      this.$store.dispatch(MutationTypes.SET_SELECTED_RUNTYPE, type);
    });
  }
}
