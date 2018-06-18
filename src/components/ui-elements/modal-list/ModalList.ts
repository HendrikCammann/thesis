/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';
import {RunType} from '../../../store/state';
import {MutationTypes} from '../../../store/mutation-types';
import {formatDate, getDayNameFromDate, getTimeRange} from '../../../utils/time/time-formatter';
import {FormatDate} from '../../../models/FormatModel';

@Component({
  template: require('./modalList.html'),
})
export class ModalList extends Vue {
  @Prop()
  items: any[];

  @Prop()
  range: string;

  private getColor(activity) {
    return getCategoryColor(activity.categorization.activity_type);
  }

  public getTime(data, type) {
    switch (type) {
      case 0:
        switch (this.range) {
          case 'short':
            return formatDate(data, FormatDate.Hour);
          case 'long':
            return getDayNameFromDate(data, false);
        }
        break;
      case 'short':
        return formatDate(data, FormatDate.Day);
      case 'long':
        return getTimeRange(data, FormatDate.Week);
    }
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
