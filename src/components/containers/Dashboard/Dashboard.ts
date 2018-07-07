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
import {Modal} from '../../ui-widgets/modal';
import {modalEvents} from '../../../events/Modal/modal';
import {ModalBox} from '../../ui-elements/modal-box';

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
    'modal': Modal,
    'modal-box': ModalBox,
    'feed': Feed,
  }
})
export class Dashboard extends Vue {
  public showModal = false;
  public modalItem = null;

  public canvasConstraints = new CanvasConstraints(0, 420, 300, 50, 1, 5);
  public menuItems = [
    {
      name: 'Tag',
      icon: 'day',
      action: DashboardViewType.Day
    },
    {
      name: 'Woche',
      icon: 'week',
      action: DashboardViewType.Week
    },
    {
      name: 'Monat',
      icon: 'month',
      action: DashboardViewType.Month
    },
    {
      name: 'Vorbereitung',
      icon: 'event',
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

    eventBus.$on(modalEvents.open_Modal, (payload) => {
      this.modalItem = payload;
      this.showModal = true;
    });

    eventBus.$on(modalEvents.close_Modal, () => {
      this.showModal = false;
      this.modalItem = null;
    });

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
