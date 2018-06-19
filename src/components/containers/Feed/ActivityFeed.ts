import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {loadingStatus} from '../../../models/App/AppStatus';
import {mapGetters} from 'vuex';
import {Feed} from '../../ui-widgets/feed';
import {BottomMenu} from '../../ui-widgets/bottom-menu';
import {DisplayType, RunType} from '../../../store/state';
import {eventBus} from '../../../main';
import {BottomMenuEvents} from '../../../events/bottom-menu/bottomMenu';
import {TimeRangeType} from '../../../models/Filter/FilterModel';

@Component({
  template: require('./activityFeed.html'),
  computed: mapGetters({
    activities: 'getSortedLists',
    loadingStatus: 'getAppLoadingStatus',
    filter: 'getDashboardFilter',
    selectedRunTyp: 'getSelectedRunType',
    timeRange: 'getTimeRange',
    rangeType: 'getTimeRangeType',
  }),
  components: {
    'feed': Feed,
    'bottomMenu': BottomMenu,
  }
})
export class ActivityFeed extends Vue {
  public selectedMenu = null;

  public menuItems = [
    {
      name: 'Zeitraum',
      icon: 'clock--gray',
      action: 'setTimeTange',
      selected: this.$store.getters.getSelectedDisplayType,
      index: 0,
      items: [{
        name: 'Total',
        icon: 'distance--gray',
        action: TimeRangeType.None,
      }, {
        name: 'Zeitspanne',
        icon: 'clock--gray',
        action: TimeRangeType.Individual,
      }]
    },
    {
      name: 'Filter',
      icon: 'filter--gray',
      action: 'toggleRunType',
      index: 1,
      selected: this.$store.getters.getSelectedRunType,
      items: [{
        name: 'Alle',
        icon: 'running--darkgray',
        action: RunType.All
      }, {
        name: 'Dauerlauf',
        icon: 'running--dl',
        action: RunType.Run
      }, {
        name: 'Langer Dauerlauf',
        icon: 'running--ldl',
        action: RunType.LongRun
      }, {
        name: 'Intervalle',
        icon: 'running--interval',
        action: RunType.ShortIntervals
      }, {
        name: 'Wettkämpfe',
        icon: 'running--comp',
        action: RunType.Competition
      }, {
        name: 'Unkategorisiert',
        icon: 'running--gray',
        action: RunType.Uncategorized
      }]
    },
  ];

  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }

    eventBus.$on(BottomMenuEvents.set_Selected_Menu, (i) => {
      this.selectedMenu = i;
    });

    eventBus.$on(BottomMenuEvents.dispatch_Overlay_Click, (payload) => {
      switch (payload.menu) {
        case 0:
          let range = null;
          if (payload.payload === TimeRangeType.Individual) {
            range = {
              end: new Date(),
              start: new Date('2018-06-09'),
            };
          }
          this.$store.dispatch(MutationTypes.SET_TIME_RANGE, {
            rangeType: payload.payload,
            range: range,
          });
          break;
        case 1:
          this.$store.dispatch(MutationTypes.SET_SELECTED_RUNTYPE, payload.payload);
          break;
      }
    });
  }
}
