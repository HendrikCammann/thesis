/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';
import {RunType} from '../../../store/state';
import {MutationTypes} from '../../../store/mutation-types';
import {formatDate, getDayNameFromDate, getTimeRange} from '../../../utils/time/time-formatter';
import {FormatDate} from '../../../models/FormatModel';

@Component({
  template: require('./modalBox.html'),
})
export class ModalBox extends Vue {
  @Prop()
  items: any;
}
