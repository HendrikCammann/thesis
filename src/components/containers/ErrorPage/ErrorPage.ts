import Vue from 'vue';
import Component from 'vue-class-component';
import {eventBus} from '../../../main';
import {menuEvents} from '../../../events/Menu/menu';
import {Button} from '../../ui-elements/button';

@Component({
  template: require('./errorPage.html'),
  components: {
    'buttonStandard': Button
  }
})
export class ErrorPage extends Vue {

  public redirect() {
    this.$router.push({
      path: '/dashboard'
    });
  }

  mounted() {
    eventBus.$emit(menuEvents.set_State, '404');
  }
}
