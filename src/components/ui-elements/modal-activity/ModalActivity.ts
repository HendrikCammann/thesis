/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';

import {
  formatDate,
  formatSecondsToDuration,
} from '../../../utils/time/time-formatter';
import {FormatDate, FormatDistanceType, FormatDurationType, FormatPaceType} from '../../../models/FormatModel';
import {formatDistance, formatPace} from '../../../utils/format-data';
import {MutationTypes} from '../../../store/mutation-types';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';

@Component({
  template: require('./modalActivity.html'),
})
export class ModalActivity extends Vue {
  @Prop()
  item: any;

  private getColor(activity) {
    return getCategoryColor(activity.categorization.activity_type);
  }

  public formatDate(date) {
    return formatDate(date, FormatDate.Day);
  }

  public formatDist(distance) {
    return formatDistance(distance, FormatDistanceType.Kilometers) + 'km';
  }

  public formatDuration(time) {
    return formatSecondsToDuration(time, FormatDurationType.Dynamic).all;
  }

  public formatPaces(pace) {
    return formatPace(pace, FormatPaceType.MinPerKm).formattedVal + '/km';
  }

  public openDetail(id: number) {
    event.preventDefault();
    event.stopPropagation();
    this.$store.dispatch(MutationTypes.SET_SELECTED_ACTIVITY, id);
    this.$router.push({
      path: '/activity/' + id
    });
  }
}
