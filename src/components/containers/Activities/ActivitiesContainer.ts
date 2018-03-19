import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {State} from '../../../store/state';

@Component({
  template: require('./activities.html')
})
export class ActivitiesContainer extends Vue {
  mounted() {
    this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
  }

  private logActivity(activityId) {
    this.$store.dispatch(MutationTypes.SET_SELECTED_ACTIVITY, activityId);
    this.$router.push({
      path: '/activity/' + activityId
    });
  }

  get activityItems() {
    return this.$store.getters.getActivities;
  }
}
