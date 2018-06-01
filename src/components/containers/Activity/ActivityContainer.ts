import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {mapGetters} from 'vuex';
import {loadingStatus} from '../../../models/App/AppStatus';
import {MapModule} from '../../modules/MapModule';
import {ZoneModule} from '../../modules/ZoneModule';
import {HeadlineBox} from '../../partials/HeadlineBox';
import {ActivityStatsModule} from '../../modules/ActivityStats';
import {ActivityGraphs} from '../../modules/ActivityGraphs';
import {TitleBox} from '../../partials/TitleBox';

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
    'mapModule': MapModule,
    'headlineBox': HeadlineBox,
    'titleBox': TitleBox,
    'activityStats': ActivityStatsModule,
    'activityGraphs': ActivityGraphs,
    'zoneModule': ZoneModule,
  }
})
export class ActivityContainer extends Vue {
  mounted() {
    // console.log(this.$route, this.$store.getters.getSelectedActivityId);
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
