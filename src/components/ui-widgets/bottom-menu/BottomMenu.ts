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

  @Prop()
  hasPopups: boolean;

  private popupOpen = false;
  public popupItems = null;
  public selectedPopup = null;
  public currentPopup = null;

  public emitEvent(payload) {
    eventBus.$emit(BottomMenuEvents.set_Dashboard_Viewtype, payload);
  }

  public togglePopup(item) {
    console.log('click');
    if (item.name === this.currentPopup) {
      this.popupOpen = false;
      this.currentPopup = null;
    } else {
      this.popupOpen = true;
      this.currentPopup = item.name;
      this.popupItems = item.items;
      this.selectedPopup = item.selected;
    }
  }
}
