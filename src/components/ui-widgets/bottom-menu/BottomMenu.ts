/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {eventBus} from '../../../main';
import {BottomMenuEvents} from '../../../events/bottom-menu/bottomMenu';
import {DashboardViewType} from '../../../store/state';

@Component({
  template: require('./bottomMenu.html'),
})
export class BottomMenu extends Vue {
  @Prop()
  menuItems: any[];

  @Prop()
  selected: string;


  public emitEvent(payload) {
    eventBus.$emit(BottomMenuEvents.set_Dashboard_Viewtype, payload);
  }
}
