import {Component} from 'vue-property-decorator';
import Vue from 'vue';
import {TrainChart} from '../../charts/TrainChart';
import {mapGetters} from 'vuex';
import {loadingStatus} from '../../../models/App/AppStatus';
import {MutationTypes} from '../../../store/mutation-types';

@Component({
  template: require('./competitions.html'),
  computed: mapGetters({
    selectedTrainingClusters: 'getSelectedTrainingClusters',
    loadingStatus: 'getAppLoadingStatus',
  }),
  components: {
    'trainChart': TrainChart,
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
