import Vue from 'vue';
import Component from 'vue-class-component';
import {loadingStatus} from '../../../models/App/AppStatus';
import {MutationTypes} from '../../../store/mutation-types';
import {mapGetters} from 'vuex';
import {StackedCompare} from '../../charts/StackedCompare';
import {CompareModule} from '../../modules/CompareModule';
import {CompareAddButton} from '../../partials/CompareAddButton';
import {compareBus, modalBus} from '../../../main';
import {compareEvents} from '../../../events/Compare/compare';
import {ModalModule} from '../../modules/ModalModule';
import {modalEvents} from '../../../events/Modal/modal';
import {CompareAddModule} from '../../modules/CompareAddModule';
import {HistoryChart} from '../../charts/HistoryChart';


@Component({
  template: require('./compare.html'),
  computed: mapGetters({
    selectedTrainingClusters: 'getSelectedTrainingClusters',
    existingClusters: 'getExistingClusters',
    loadingStatus: 'getAppLoadingStatus',
    sortedLists: 'getSortedLists',
    filter: 'getFilter',
  }),
  components: {
    'stackedCompare': StackedCompare,
    'compareModule': CompareModule,
    'compareAddModule': CompareAddModule,
    'compareAddButton': CompareAddButton,
    'historyChart': HistoryChart,
  }
})
export class CompareContainer extends Vue {
  public selectedCluster = '';

  public selectTrainingCluster() {
    this.$store.dispatch(MutationTypes.ADD_SELECTED_TRAINING_CLUSTER, this.selectedCluster);
    this.selectedCluster = '';
  }

  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }

    compareBus.$on(compareEvents.remove_Training_Cluster, (type) => {
      this.$store.dispatch(MutationTypes.REMOVE_SELECTED_TRAINING_CLUSTER, type);
    });

    compareBus.$on(compareEvents.add_Training_Cluster, (type) => {
      this.$store.dispatch(MutationTypes.ADD_SELECTED_TRAINING_CLUSTER, type);
    });
  }
}
