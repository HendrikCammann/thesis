import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {State} from '../../../store/state';
import {BubbleChart} from '../../modules/BubbleChart';
import {mapGetters} from 'vuex';

@Component({
  template: require('./activities.html'),
  computed: mapGetters({
    activities: 'getActivities',
  }),
  components: {
    'bubbleChart': BubbleChart
  }
})
export class ActivitiesContainer extends Vue {
  mounted() {
    this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
  }

  private logActivity(activityId) {
    console.log(activityId);
    this.$store.dispatch(MutationTypes.SET_SELECTED_ACTIVITY, activityId);
    this.$router.push({
      path: '/activity/' + activityId
    });
  }

  /*
  get activityItems() {
    return this.$store.getters.getActivities;
  }

  get sortedActivityItems() {
    return this.$store.getters.getSortedActivities;
  }

  get sortedActivityYears() {
    return this.$store.getters.getSortedActivitiesYears;
  }
  */
}
