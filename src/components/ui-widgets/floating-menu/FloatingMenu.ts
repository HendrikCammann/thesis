/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {eventBus} from '../../../main';
import {FloatingMenuEvents} from '../../../events/floating-menu/FloatingMenu';

@Component({
  template: require('./floatingMenu.html'),
})
export class FloatingMenu extends Vue {
  @Prop()
  menuItemsTop: any[];

  @Prop()
  menuItemsLeft: any[];

  @Prop()
  selectedItems: any;

  public menuActive: boolean = false;

  public toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  public setActive(item, state) {
    return item === state;
  }

  public handleMenuClick(action, isTop: boolean) {
    eventBus.$emit(FloatingMenuEvents.set_Filter, {action: action, isTop: isTop});
  }

}
