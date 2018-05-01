/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {eventBus} from '../../../main';
import {modalEvents} from '../../../events/Modal/modal';

@Component({
  template: require('./modalModule.html'),
})
export class ModalModule extends Vue {

  public closeModal () {
    eventBus.$emit(modalEvents.close_Modal)
  }
  mounted() {
  }
}
