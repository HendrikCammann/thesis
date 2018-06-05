import {Component} from 'vue-property-decorator';
import Vue from 'vue';
import {mapGetters} from 'vuex';
import {loadingStatus} from '../../../models/App/AppStatus';
import {MutationTypes} from '../../../store/mutation-types';
import {TrainCompareModule} from '../../modules/TrainCompareModule';
import {SmartFilterModule} from '../../modules/SmartFilterModule';
import {CompareModule} from '../../modules/CompareModule';
import {eventBus} from '../../../main';
import {modalEvents} from '../../../events/Modal/modal';
import {DoughnutChart} from '../../charts/DoughnutChart';
import {RunType} from '../../../store/state';
import {compareEvents} from '../../../events/Compare/compare';
import {DetailToggleModule} from '../../modules/DetailToggleModule';
import {DisplayTypeToggleModule} from '../../modules/DisplayTypeToggleModule';
import {CompareAddModule} from '../../modules/CompareAddModule';

@Component({
  template: require('./comparison.html'),
  computed: mapGetters({
    selectedTrainingClusters: 'getSelectedTrainingClusters',
    selectedWeeks: 'getSelectedWeeks',
    existingClusters: 'getExistingClusters',
    loadingStatus: 'getAppLoadingStatus',
    selectedRunType: 'getSelectedRunType',
    selectedDisplayType: 'getSelectedDisplayType',
    showEverything: 'getShowEverything',
    sortedLists: 'getSortedLists',
  }),
  components: {
    'trainCompare': TrainCompareModule,
    'smartFilter': SmartFilterModule,
    'displayToggle': DisplayTypeToggleModule,
    'detailToggle': DetailToggleModule,
    'compareAdd': CompareAddModule,
    'compareModule': CompareModule,
    'doughnutChart': DoughnutChart,
  },
})
export class ComparisonContainer extends Vue {
  public showModal = false;
  public selectedCluster = '';
  public hoveredRunType = RunType.All;

  private progressStep = 0;

  private nextStep() {
    this.progressStep = 1;
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

    eventBus.$on(compareEvents.remove_Training_Cluster, (type) => {
      this.$store.dispatch(MutationTypes.REMOVE_SELECTED_TRAINING_CLUSTER, type);
    });

    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }
  }
}
