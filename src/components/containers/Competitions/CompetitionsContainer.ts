import {Component} from 'vue-property-decorator';
import Vue from 'vue';
import {mapGetters} from 'vuex';
import {loadingStatus} from '../../../models/App/AppStatus';
import {MutationTypes} from '../../../store/mutation-types';
import {TrainCompareModule} from '../../modules/TrainCompareModule';
import {SmartFilterModule} from '../../modules/SmartFilterModule';
import {CompareModule} from '../../modules/CompareModule';
import {ModalModule} from '../../modules/ModalModule';
import {eventBus} from '../../../main';
import {modalEvents} from '../../../events/Modal/modal';
import {DoughnutChart} from '../../charts/DoughnutChart';
import {RunType} from '../../../store/state';
import {compareEvents} from '../../../events/Compare/compare';
import {ModalButtonModule} from '../../modules/ModalButtonModule';
import {DetailToggleModule} from '../../modules/DetailToggleModule';
import {CardModule} from '../../modules/CardModule';
import {TagItem} from '../../partials/TagItem';

@Component({
  template: require('./competitions.html'),
  computed: mapGetters({
    selectedTrainingClusters: 'getSelectedTrainingClusters',
    selectedWeeks: 'getSelectedWeeks',
    selectedWeeksLength: 'getSelectedWeeksLength',
    existingClusters: 'getExistingClusters',
    loadingStatus: 'getAppLoadingStatus',
    selectedRunType: 'getSelectedRunType',
    showEverything: 'getShowEverything',
    sortedLists: 'getSortedLists',
  }),
  components: {
    'cardModule': CardModule,
    'tagItem': TagItem,
    'trainCompare': TrainCompareModule,
    'smartFilter': SmartFilterModule,
    'modalButton': ModalButtonModule,
    'detailToggle': DetailToggleModule,
    'compareModule': CompareModule,
    'modalModule': ModalModule,
    'doughnutChart': DoughnutChart,
  },
})
export class CompetitionsContainer extends Vue {
  public showModal = false;
  public selectedCluster = '';
  public hoveredRunType = RunType.All;

  public openModal() {
    eventBus.$emit(modalEvents.open_Modal);
  }

  mounted() {
    eventBus.$on(modalEvents.close_Modal, () => {
      this.showModal = false;
    });

    eventBus.$on(modalEvents.open_Modal, () => {
      this.showModal = true;
    });

    eventBus.$on(compareEvents.set_Hovered_Run_Type, (type) => {
      this.hoveredRunType = type;
    });

    eventBus.$on(compareEvents.add_Training_Cluster, (type) => {
      this.$store.dispatch(MutationTypes.ADD_SELECTED_TRAINING_CLUSTER, type);
    });

    eventBus.$on(compareEvents.remove_Training_Cluster, (type) => {
      this.$store.dispatch(MutationTypes.REMOVE_SELECTED_TRAINING_CLUSTER, type);
    });

    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }
  }
}
