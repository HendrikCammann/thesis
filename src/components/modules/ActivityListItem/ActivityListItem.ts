/* tslint:disable */
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';
import {MutationTypes} from '../../../store/mutation-types';

@Component({
  template: require('./ActivityListItem.html'),
})
export class ActivityListItem extends Vue {
  @Prop()
  activityId: number;

  get activity() {
    return this.$store.getters.getActivity(this.activityId);
  }

  private logActivity(activityId) {
    this.$store.dispatch(MutationTypes.SET_SELECTED_ACTIVITY, activityId);
    this.$router.push({
      path: '/activity/' + activityId
    });
  }
}
