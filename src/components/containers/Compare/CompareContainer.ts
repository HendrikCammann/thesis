import Vue from 'vue';
import Component from 'vue-class-component';
import {loadingStatus} from '../../../models/App/AppStatus';
import {MutationTypes} from '../../../store/mutation-types';
import {mapGetters} from 'vuex';
import {StackedCompare} from '../../charts/StackedCompare';
import {CompareModule} from '../../modules/CompareModule';
import {CompareAddButton} from '../../partials/CompareAddButton';
import {compareBus, filterBus, modalBus} from '../../../main';
import {compareEvents} from '../../../events/Compare/compare';
import {ModalModule} from '../../modules/ModalModule';
import {modalEvents} from '../../../events/Modal/modal';
import {CompareAddModule} from '../../modules/CompareAddModule';
import {HistoryChart} from '../../charts/HistoryChart';
import {RangeSlider} from '../../partials/RangeSlider';
import {filterEvents} from '../../../events/filter';
import {DonutChart} from '../../charts/DonutChart';


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
    'rangeSlider': RangeSlider,
    'donutChart': DonutChart,
  }
})
export class CompareContainer extends Vue {
  public selectedCluster = '';
  public filterRange = [0, 1140];

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

    filterBus.$on(filterEvents.set_Compare_Time_Range, (type) => {
      this.filterRange = type;
    });

    filterBus.$on(filterEvents.set_Compare_Shown_Bars, (type) => {
      console.log('event dispatched');
      this.$store.dispatch(MutationTypes.SET_SHOWN_COMPARE_ACTIVITIES, type);
    });
  }
}
