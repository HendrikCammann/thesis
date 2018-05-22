import {Component} from 'vue-property-decorator';
import Vue from 'vue';
import {mapGetters} from 'vuex';
import {loadingStatus} from '../../../models/App/AppStatus';
import {MutationTypes} from '../../../store/mutation-types';
import {TrainCompareModule} from '../../modules/TrainCompareModule';
import {SmartFilterModule} from '../../modules/SmartFilterModule';
import {CompareModule} from '../../modules/CompareModule';

@Component({
  template: require('./competitions.html'),
  computed: mapGetters({
    selectedTrainingClusters: 'getSelectedTrainingClusters',
    loadingStatus: 'getAppLoadingStatus',
    selectedRunType: 'getSelectedRunType',
    showEverything: 'getShowEverything',
    sortedLists: 'getSortedLists',
  }),
  components: {
    'trainCompare': TrainCompareModule,
    'smartFilter': SmartFilterModule,
    'compareModule': CompareModule,
  },
})
export class CompetitionsContainer extends Vue {
  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }
  }
}
