/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';
import {RunType} from '../../../store/state';
import {MutationTypes} from '../../../store/mutation-types';
import {formatDate, getDayNameFromDate, getTimeRange} from '../../../utils/time/time-formatter';
import {FormatDate} from '../../../models/FormatModel';
import {Button} from '../button';
import {eventBus} from '../../../main';
import {modalEvents} from '../../../events/Modal/modal';

@Component({
  template: require('./modalTime.html'),
  components: {
    'standardButton': Button
  }
})
export class ModalTime extends Vue {
  public start = null;
  public end = null;

  public handleClick () {
    event.stopPropagation();
  }

  public submit() {
    event.stopPropagation();
    if (this.start === null) {
      this.start = new Date(1970).toString();
    }

    if (this.end === null) {
      this.end = new Date().toString();
    }

    let item = {
      start: this.start,
      end: this.end,
    };

    eventBus.$emit(modalEvents.close_Modal_With_Callback, item);
  }
}
