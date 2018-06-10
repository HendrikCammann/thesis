import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {loadingStatus} from '../../../models/App/AppStatus';
import {mapGetters} from 'vuex';
import {Feed} from '../../ui-widgets/feed';

@Component({
  template: require('./activityFeed.html'),
  computed: mapGetters({
    activities: 'getSortedLists',
    loadingStatus: 'getAppLoadingStatus',
    filter: 'getDashboardFilter',
  }),
  components: {
    'feed': Feed,
  }
})
export class ActivityFeed extends Vue {
  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }
  }
}
