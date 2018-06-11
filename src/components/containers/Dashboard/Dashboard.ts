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
import {BottomMenu} from '../../ui-widgets/bottom-menu';
import {DashboardViewType, RunType} from '../../../store/state';
import {BottomMenuEvents} from '../../../events/bottom-menu/bottomMenu';
import {Feed} from '../../ui-widgets/feed';

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
    'bottomMenu': BottomMenu,
    'feed': Feed,
  }
})
export class Dashboard extends Vue {

  public canvasConstraints = new CanvasConstraints(0, 420, 300, 50, 1, 5);
  public menuItems = [
    {
      name: 'Tag',
      icon: 'running--gray',
      action: DashboardViewType.Day
    },
    {
      name: 'Woche',
      icon: 'running--gray',
      action: DashboardViewType.Week
    },
    {
      name: 'Monat',
      icon: 'running--gray',
      action: DashboardViewType.Month
    },
    {
      name: 'Vorbereitung',
      icon: 'running--gray',
      action: DashboardViewType.Preparation
    },
  ];

  mounted() {
    /*if (this.$store.getters.getAppLoadingStatus.athlete === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_ATHLETE_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ATHLETE);
    }*/

    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }

    eventBus.$on(BottomMenuEvents.set_Dashboard_Viewtype, (payload) => {
      this.$store.dispatch(MutationTypes.SET_DASHBOARD_VIEWTYPE, payload);
    });

    eventBus.$on(navigationEvents.open_Activity_Detail, (activityId) => {
      this.$store.dispatch(MutationTypes.SET_SELECTED_ACTIVITY, activityId);
      this.$router.push({
        path: '/activity/' + activityId
      });
    });
  }

  public get firstHeadline() {
    switch (this.$store.state.dashboardViewType) {
      case DashboardViewType.Day:
        return 'Dein bisheriger Tag';
      case DashboardViewType.Week:
        return 'Deine bisherigere Woche';
      case DashboardViewType.Month:
        return 'Dein bisheriger Monat';
      case DashboardViewType.Preparation:
        return 'Deinee bisherige Vorbereitung';
    }
  }

  public get secondHeadline() {
    switch (this.$store.state.dashboardViewType) {
      case DashboardViewType.Day:
        return 'Heutige Einheiten';
      case DashboardViewType.Week:
        return 'Im Vergleich zur letzten Woche';
      case DashboardViewType.Month:
        return 'Im Vergleich zum letzten Monat';
      case DashboardViewType.Preparation:
        return 'Leistungsentwicklung';
    }
  }
}
