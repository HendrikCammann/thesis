/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {Toggle} from '../../ui-elements/toggle';
import {eventBus} from '../../../main';
import {TrainChart} from '../../visualizations/train-chart';
import {mapGetters} from 'vuex';
import {ToggleEvents} from '../../../events/toggle/Toggle';
import {ActivitiesList} from '../activities-list';
import {Modal} from '../modal';
import {modalEvents} from '../../../events/Modal/modal';
import {ModalList} from '../../ui-elements/modal-list';

@Component({
  template: require('./activitiesGraph.html'),
  computed: mapGetters({
    sortedLists: 'getSortedLists',
    loadingStatus: 'getAppLoadingStatus',
    selectedRunType: 'getSelectedRunType',
    selectedDisplayType: 'getSelectedDisplayType',
    showEverything: 'getShowEverything',
  }),
  components: {
    'toggle-standard': Toggle,
    'activities-list': ActivitiesList,
    'train-chart': TrainChart,
    'modal': Modal,
    'modal-list': ModalList,
  }
})
export class ActivitiesGraph extends Vue {
  @Prop()
  cluster: any;

  public showModal = false;
  public modalItem = null;
  public toggleData: string[] = ['Entwicklung', 'Liste'];
  public selectedToggle: number = 0;

  mounted() {
    eventBus.$on(ToggleEvents.set_Selection, (index) => {
      this.selectedToggle = index;
    });

    eventBus.$on(modalEvents.open_Modal, (item) => {
      this.showModal = true;
      this.modalItem = item;
    });

    eventBus.$on(modalEvents.close_Modal, () => {
      this.showModal = false;
      this.modalItem = null;
    });
  }
}
