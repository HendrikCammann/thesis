import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {loadingStatus} from '../../../models/App/AppStatus';
import {eventBus} from '../../../main';
import {modalEvents} from '../../../events/Modal/modal';
import {Modal} from '../../ui-widgets/modal';


@Component({
  template: require('./performance.html'),
  components: {
    'modal': Modal,
  }
})
export class Performance extends Vue {
  public showModal = false;
  public modalItem = null;

  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }

    eventBus.$on(modalEvents.open_Modal, (payload) => {
      this.modalItem = payload;
      this.showModal = true;
    });

    eventBus.$on(modalEvents.close_Modal, () => {
      this.showModal = false;
      this.modalItem = null;
    });
  }
}
