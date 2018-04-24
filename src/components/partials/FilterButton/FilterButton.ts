/* tslint:disable */
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';
import {filterBus} from '../../../main';
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
    filterBus.$emit(filterEvents.selected_Run_Type, this.content.type)
  }
}
