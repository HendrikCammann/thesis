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
  activity: any;

  private getDayName() {
    let date = new Date(this.activity.date);
    return getDayName(date.getDay(), false);
  }

  private getColor() {
    return getCategoryColor(this.activity.categorization.activity_type);
  }

  private openDetailView() {
    this.$store.dispatch(MutationTypes.SET_SELECTED_ACTIVITY, this.activity.id);
    this.$router.push({
      path: '/activity/' + this.activity.id
    });
  }

  mounted() {
  }
}
