import Vue from 'vue';
import Component from 'vue-class-component';
import {eventBus} from '../../../main';
import {menuEvents} from '../../../events/Menu/menu';
import {Button} from '../../ui-elements/button';

@Component({
  template: require('./app.html'),
  components: {
    'button-standard': Button
  }
})
export class AppContainer extends Vue {

  public startApp() {
    this.$router.push({
      path: 'dashboard'
    });
  }

  mounted() {
    eventBus.$emit(menuEvents.set_State, 'bidh.io');
  }

}
