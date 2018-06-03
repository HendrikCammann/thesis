import Vue from 'vue';
import Component from 'vue-class-component';
import {loadingStatus} from '../../../models/App/AppStatus';
import {MutationTypes} from '../../../store/mutation-types';
import {mapGetters} from 'vuex';
import {eventBus} from '../../../main';
import {compareEvents} from '../../../events/Compare/compare';
import {CompareSelect} from '../../ui-widgets/compare-select';
import {CompareBoxes} from '../../ui-widgets/compare-boxes';


@Component({
  template: require('./compare.html'),
  computed: mapGetters({
    selectedTrainingClustersData: 'getSelectedTrainingClustersData',
    selectedTrainingClustersFull: 'getSelectedTrainingClustersFull',
    selectedTrainingClusters: 'getSelectedTrainingClusters',
    existingClusters: 'getExistingClusters',
    loadingStatus: 'getAppLoadingStatus',
    sortedLists: 'getSortedLists',
    filter: 'getFilter',
    shownBars: 'getShownBars',
    showAbsolute: 'getShowAbsolute',
    timeRanges: 'getTimeRanges',
  }),
  components: {
    'compare-select': CompareSelect,
    'compare-boxes': CompareBoxes
  }
})
export class CompareContainer extends Vue {
  public isSelection = true;
  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }

    eventBus.$on(compareEvents.start_Compare, () => {
      this.$router.push({ path: `/compare?step=${'compare'}` });
    });
  }

  updated() {
    if (this.$route.query.step && this.$route.query.step === 'compare') {
      if (this.$store.getters.getSelectedTrainingClusters.length === 2) {
        this.isSelection = false;
      } else {
        this.$router.push({ path: `/compare` });
        this.isSelection = true;
      }
    }
  }
}
