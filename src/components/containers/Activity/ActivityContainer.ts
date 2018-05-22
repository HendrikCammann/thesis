import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {mapGetters} from 'vuex';
import {loadingStatus} from '../../../models/App/AppStatus';
import {ZoneChart} from '../../charts/ZoneChart';
import {BarChart} from '../../charts/BarChart';
import {MapModule} from '../../modules/MapModule';

/* tslint:disable */
@Component({
  template: require('./activity.html'),
  computed: mapGetters({
    getSelectedActivity: 'getSelectedActivity',
    getSelectedActivityStreams: 'getSelectedActivityStreams',
    getSelectedActivityZones: 'getSelectedActivityZones',
    loadingStatus: 'getAppLoadingStatus',
  }),
  components: {
    'barChart': BarChart,
    'zoneChart': ZoneChart,
    'mapModule': MapModule,
  }
})
export class ActivityContainer extends Vue {
  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.Loaded) {
      this.$store.dispatch(MutationTypes.GET_ACTIVITY, this.$store.getters.getSelectedActivityId);
    }
    // this.$store.dispatch(MutationTypes.GET_ACTIVITY_STREAMS, this.$store.getters.getSelectedActivityId);
    // this.$store.dispatch(MutationTypes.GET_ACTIVITY_ZONES, this.$store.getters.getSelectedActivityId);
  }

}
