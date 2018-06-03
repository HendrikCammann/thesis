/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {eventBus} from '../../../main';
import {compareEvents} from '../../../events/Compare/compare';

@Component({
  template: require('./toggle.html'),
})
export class Toggle extends Vue {
  @Prop()
  options: string[];

  @Prop()
  selectedOption: number;

  public isActive(index: number) {
    return index === this.selectedOption;
  }

  public width() {
    return 100 / this.options.length;
  }

  public handleToggle(index: number) {
    eventBus.$emit(compareEvents.changed_ClusterView, index);
  }
}
