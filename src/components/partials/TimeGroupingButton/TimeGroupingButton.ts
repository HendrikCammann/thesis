/* tslint:disable */
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';
import {eventBus} from '../../../main';
import {filterEvents} from '../../../events/filter';

@Component({
  template: require('./timeGroupingButton.html'),
})
export class TimeGroupingButton extends Vue {
  @Prop()
  content: any;

  @Prop()
  isActive: boolean;

  public toggleFilter() {
    eventBus.$emit(filterEvents.selected_Time_Group, this.content.type)
  }
}
