/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';

import {
  formatDate,
  formatSecondsToDuration,
} from '../../../utils/time/time-formatter';
import {FormatDate, FormatDurationType, FormatPaceType} from '../../../models/FormatModel';
import {formatPace} from '../../../utils/format-data';
import {MutationTypes} from '../../../store/mutation-types';

@Component({
  template: require('./modalActivity.html'),
})
export class ModalActivity extends Vue {
  @Prop()
  item: any;

  public formatDate(date) {
    return formatDate(date, FormatDate.Day);
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
