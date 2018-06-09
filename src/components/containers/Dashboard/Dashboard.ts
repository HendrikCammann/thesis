import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {loadingStatus} from '../../../models/App/AppStatus';
import {mapGetters} from 'vuex';

import {CanvasConstraints} from '../../../models/VisualVariableModel';
import {navigationEvents} from '../../../events/Navigation/Navigation';
import {eventBus} from '../../../main';
import {DashboardBoxes} from '../../ui-widgets/dashboard-boxes';
import {Divider} from '../../ui-elements/divider';
import {HistoryChart} from '../../visualizations/history-chart';

@Component({
  template: require('./dashboard.html'),
  computed: mapGetters({
    user: 'getAthlete',
    activities: 'getSortedLists',
    latestActivity: 'getLatestActivity',
    actualWeek: 'getActualWeekActivities',
    monthStats: 'getActualMonthStats',
    loadingStatus: 'getAppLoadingStatus',
    filter: 'getDashboardFilter',
    viewType: 'getDashboardViewType',
    currentPreparation: 'getCurrentPreparation',
  }),
  components: {
    'dashboardBoxes': DashboardBoxes,
    'divider': Divider,
    'historyChart': HistoryChart,
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
