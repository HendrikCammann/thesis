import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {eventBus} from '../../../main';
import {modalEvents} from '../../../events/Modal/modal';

@Component({
  template: require('./modalButtonModule.html'),
})
export class ModalButtonModule extends Vue {
  @Prop()
  counter: number;

  public openModal() {
    eventBus.$emit(modalEvents.open_Modal);
  }
}
