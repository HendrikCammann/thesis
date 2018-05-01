/* tslint:disable */
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';
import {eventBus} from '../../../main';
import {filterEvents} from '../../../events/filter';

@Component({
  template: require('./filterButton.html'),
})
export class FilterButton extends Vue {
  @Prop()
  content: any;

  @Prop()
  isActive: boolean;

  public toggleFilter() {
    eventBus.$emit(filterEvents.selected_Run_Type, this.content.type)
  }
}
