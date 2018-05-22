import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {mapGetters} from 'vuex';
import {ActivityList} from '../../modules/ActivityList';
import {loadingStatus} from '../../../models/App/AppStatus';
import {TrainChart} from '../../charts/TrainChart';

@Component({
  template: require('./activities.html'),
  computed: mapGetters({
    sortedLists: 'getSortedLists',
    loadingStatus: 'getAppLoadingStatus',
    selectedRunType: 'getSelectedRunType',
    showEverything: 'getShowEverything',
  }),
  components: {
    'trainChart': TrainChart,
    'activityList': ActivityList,
  }
})
export class ActivitiesContainer extends Vue {
  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }
  }
}
