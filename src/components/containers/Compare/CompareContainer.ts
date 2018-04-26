import Vue from 'vue';
import Component from 'vue-class-component';
import {loadingStatus} from '../../../models/App/AppStatus';
import {MutationTypes} from '../../../store/mutation-types';
import {mapGetters} from 'vuex';
import {StackedCompare} from '../../Charts/StackedCompare';


@Component({
  template: require('./compare.html'),
  computed: mapGetters({
    selectedTrainingClusters: 'getSelectedTrainingClusters',
    loadingStatus: 'getAppLoadingStatus',
    sortedLists: 'getSortedLists',
  }),
  components: {
    'stackedCompare': StackedCompare,
  }
})
export class CompareContainer extends Vue {

  public tCL = this.$store.getters.getSelectedTrainingClusters;

  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }
  }

}
