import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {State} from '../../../store/state';
import {BubbleChart} from '../../modules/BubbleChart';
import {mapGetters} from 'vuex';
import {ActivityListItem} from '../../modules/ActivityListItem';

@Component({
  template: require('./activities.html'),
  computed: mapGetters({
    activities: 'getActivities',
    sortedActivities: 'getSortedActivities'
  }),
  components: {
    'bubbleChart': BubbleChart,
    'activityListItem': ActivityListItem
  }
})
export class ActivitiesContainer extends Vue {
  mounted() {
    this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
  }
}
