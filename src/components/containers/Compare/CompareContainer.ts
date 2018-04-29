import Vue from 'vue';
import Component from 'vue-class-component';
import {loadingStatus} from '../../../models/App/AppStatus';
import {MutationTypes} from '../../../store/mutation-types';
import {mapGetters} from 'vuex';
import {StackedCompare} from '../../charts/StackedCompare';
import {CompareModule} from '../../modules/CompareModule';
import {CompareAddButton} from '../../partials/CompareAddButton';
import {compareBus, filterBus} from '../../../main';
import {filterEvents} from '../../../events/filter';
import {compareEvents} from '../../../events/Compare/compare';


@Component({
  template: require('./compare.html'),
  computed: mapGetters({
    selectedTrainingClusters: 'getSelectedTrainingClusters',
    loadingStatus: 'getAppLoadingStatus',
    sortedLists: 'getSortedLists',
    filter: 'getFilter',
  }),
  components: {
    'stackedCompare': StackedCompare,
    'compareModule': CompareModule,
    'compareAddButton': CompareAddButton
  }
})
export class CompareContainer extends Vue {
  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }

    compareBus.$on(compareEvents.remove_Training_Cluster, (type) => {
      this.$store.dispatch(MutationTypes.REMOVE_SELECTED_TRAINING_CLUSTER, type);
    });
  }
}
