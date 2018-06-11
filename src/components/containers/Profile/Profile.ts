import Vue from 'vue';
import Component from 'vue-class-component';
import {eventBus} from '../../../main';
import {menuEvents} from '../../../events/Menu/menu';


@Component({
  template: require('./profile.html')
})
export class Profile extends Vue {

  mounted() {
    eventBus.$emit(menuEvents.set_State, 'Hendrik Cammann');
  }
}
