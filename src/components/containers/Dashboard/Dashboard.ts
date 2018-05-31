import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {loadingStatus} from '../../../models/App/AppStatus';
import {mapGetters} from 'vuex';

import {CanvasConstraints} from '../../../models/VisualVariableModel';
import {WaveChart} from '../../charts/WaveChart';
import {MapModule} from '../../modules/MapModule';
import {HeadlineBox} from '../../partials/HeadlineBox';
import {LastRunModule} from '../../modules/LastRunModule';
import {navigationEvents} from '../../../events/Navigation/Navigation';
import {eventBus} from '../../../main';
import {UserModule} from '../../modules/User';
import {PreparationTeaserModule} from '../../modules/PreparationTeaser';
import {CurrentWeekModule} from '../../modules/CurrentWeek';

@Component({
  template: require('./dashboard.html'),
  computed: mapGetters({
    user: 'getAthlete',
    latestActivity: 'getLatestActivity',
    actualWeek: 'getActualWeekActivities',
    monthStats: 'getActualMonthStats',
    loadingStatus: 'getAppLoadingStatus',
    filter: 'getDashboardFilter',
  }),
  components: {
    'userModule': UserModule,
    'preparationTeaserModule': PreparationTeaserModule,
    'currentWeekModule': CurrentWeekModule,
    'headlineBox': HeadlineBox,
    'lastRunModule': LastRunModule,
    'waveChart': WaveChart,
    'mapModule': MapModule,
  }
})
export class Dashboard extends Vue {

  public canvasConstraints = new CanvasConstraints(0, 420, 300, 50, 1, 5);

  mounted() {
    /*if (this.$store.getters.getAppLoadingStatus.athlete === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_ATHLETE_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ATHLETE);
    }*/

    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }

    eventBus.$on(navigationEvents.open_Activity_Detail, (activityId) => {
      this.$store.dispatch(MutationTypes.SET_SELECTED_ACTIVITY, activityId);
      this.$router.push({
        path: '/activity/' + activityId
      });
    });
  }
}
