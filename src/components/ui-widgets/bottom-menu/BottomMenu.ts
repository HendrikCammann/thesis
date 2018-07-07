/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {eventBus} from '../../../main';
import {BottomMenuEvents} from '../../../events/bottom-menu/bottomMenu';
import {DashboardViewType} from '../../../store/state';
import {loadingStatus} from '../../../models/App/AppStatus';

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

  @Prop()
  selectedMenu: number;

  @Prop()
  selectedItems: any[];

  private popupOpen = false;
  public popupItems = null;
  public selectedPopup = null;
  public currentPopup = null;

  public emitEvent(payload) {
    if (this.hasPopups) {
      eventBus.$emit(BottomMenuEvents.dispatch_Overlay_Click, {payload: payload, menu: this.selectedMenu})
    } else {
      eventBus.$emit(BottomMenuEvents.set_Dashboard_Viewtype, payload);
    }
    this.popupOpen = false;
  }

  public togglePopup(item, i) {
    if (item.name === this.currentPopup) {
      this.popupOpen = false;
      this.currentPopup = null;
    } else {
      eventBus.$emit(BottomMenuEvents.set_Selected_Menu, i);
      this.popupOpen = true;
      this.currentPopup = item.name;
      this.popupItems = item.items;
      this.selectedPopup = item.selected;
    }
  }
}
