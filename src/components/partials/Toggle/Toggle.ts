/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {eventBus} from '../../../main';
import {detailEvents} from '../../../events/Detail/detail';
import {loadingStatus} from '../../../models/App/AppStatus';

@Component({
  template: require('./toggle.html'),
})
export class Toggle extends Vue {
  @Prop()
  items: string[];

  @Prop()
  selectedOption: number;

  private selected: number;

  public setActive(index: number) {
    return index === this.selectedOption;
  }

  public setSelected(index: number) {
    this.selected = index;
    eventBus.$emit(detailEvents.selected_lap_type, index);
  }
}
