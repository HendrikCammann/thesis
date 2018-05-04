import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {State} from '../../../store/state';
import {mapGetters} from 'vuex';
import { LineChart } from '../../charts/LineChart/';
import {loadingStatus} from '../../../models/App/AppStatus';
import {ZoneChart} from '../../charts/ZoneChart';

/* tslint:disable */
@Component({
  template: require('./activity.html'),
  computed: mapGetters({
    getSelectedActivity: 'getSelectedActivity',
    getSelectedActivityStreams: 'getSelectedActivityStreams',
    getSelectedActivityZones: 'getSelectedActivityZones',
  }),
  components: {
    'linechart': LineChart,
    'zoneChart': ZoneChart,
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
