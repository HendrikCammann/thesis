import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {getDayName} from '../../../utils/time/time-formatter';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';
import {MutationTypes} from '../../../store/mutation-types';

@Component({
  template: require('./activityListItem.html'),
})
export class ActivityListItem extends Vue {
  @Prop()
  activity: any[];

  private getDayName(activity) {
    let date = new Date(activity.date);
    return getDayName(date.getDay(), false);
  }

  private getColor(activity) {
    return getCategoryColor(activity.categorization.activity_type);
  }

  private openDetailView(activity) {
    this.$store.dispatch(MutationTypes.SET_SELECTED_ACTIVITY, activity.id);
    this.$router.push({
      path: '/activity/' + activity.id
    });
  }

  mounted() {
  }
}
