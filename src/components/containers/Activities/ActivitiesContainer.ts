import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {RunType, State} from '../../../store/state';
import {BubbleChart} from '../../modules/BubbleChart';
import {mapGetters} from 'vuex';
import {ActivityListItem} from '../../modules/ActivityListItem';

@Component({
  template: require('./activities.html'),
  computed: mapGetters({
    activities: 'getActivities',
    sortedActivities: 'getSortedActivities',
    selectedRunType: 'getSelectedRunType'
  }),
  components: {
    'bubbleChart': BubbleChart,
    'activityListItem': ActivityListItem
  }
})
export class ActivitiesContainer extends Vue {

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

  mounted() {
    this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
  }
}
