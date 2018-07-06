import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {mapGetters} from 'vuex';
import {loadingStatus} from '../../../models/App/AppStatus';
import {DetailMap} from '../../ui-widgets/detail-map';
import {HeadlineBox} from '../../ui-elements/headline-box';
import {ActivityBoxes} from '../../ui-widgets/activity-boxes';
import {ActivityZones} from '../../ui-widgets/activity-zones';
import {ActivityDetails} from '../../ui-widgets/activity-details/ActivityDetails';
import {menuEvents} from '../../../events/Menu/menu';
import {eventBus} from '../../../main';
import {Divider} from '../../ui-elements/divider';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';
import {modalEvents} from '../../../events/Modal/modal';
import {ModalBox} from '../../ui-elements/modal-box';
import {Modal} from '../../ui-widgets/modal';

/* tslint:disable */
@Component({
  template: require('./activity.html'),
  computed: mapGetters({
    getSelectedActivity: 'getSelectedActivity',
    getSelectedActivityStreams: 'getSelectedActivityStreams',
    getSelectedActivityZones: 'getSelectedActivityZones',
    loadingStatus: 'getAppLoadingStatus',
  }),
  components: {
    'detailMap': DetailMap,
    'headlineBox': HeadlineBox,
    'activityBoxes': ActivityBoxes,
    'activityZones': ActivityZones,
    'activityDetails': ActivityDetails,
    'modal': Modal,
    'modal-box': ModalBox,
    'divider': Divider,
  }
})
export class ActivityContainer extends Vue {
  public showModal = false;
  public modalItem = null;
  public blockRender = true;

  public getColor(type) {
    return getCategoryColor(type);
  }

  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
      this.$store.dispatch(MutationTypes.SET_SELECTED_ACTIVITY, parseInt(this.$route.params.id));
      this.blockRender = false;
    }

    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.Loaded) {
      this.$store.dispatch(MutationTypes.GET_ACTIVITY, this.$store.getters.getSelectedActivityId);
      eventBus.$emit(menuEvents.set_State, this.$store.getters.getSelectedActivity.name);
      this.blockRender = false;
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
