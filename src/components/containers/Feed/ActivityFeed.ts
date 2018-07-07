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
import {Modal} from '../../ui-widgets/modal';
import {modalEvents} from '../../../events/Modal/modal';
import {ModalTime} from '../../ui-elements/modal-time';
import {menuEvents} from '../../../events/Menu/menu';
import {formatDate} from '../../../utils/time/time-formatter';
import {FormatDate} from '../../../models/FormatModel';

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
    'modal': Modal,
    'modalTime': ModalTime,
    'bottomMenu': BottomMenu,
  }
})
export class ActivityFeed extends Vue {
  public selectedMenu = null;
  public showModal = false;

  public menuItems = [
    {
      name: 'Zeitraum',
      icon: 'range--dark',
      action: 'setTimeTange',
      selected: this.$store.getters.getSelectedDisplayType,
      index: 0,
      items: [{
        name: 'Alle anzeigen',
        icon: 'hide',
        action: TimeRangeType.None,
      }, {
        name: 'Zeitspanne auswählen',
        icon: 'range--dark',
        action: TimeRangeType.Individual,
      }]
    },
    {
      name: 'Filter',
      icon: 'filter--dark',
      action: 'toggleRunType',
      index: 1,
      selected: this.$store.getters.getSelectedRunType,
      items: [{
        name: 'Alle',
        icon: 'run--dark',
        action: RunType.All
      }, {
        name: 'Langer Dauerlauf',
        icon: 'run--ldl',
        action: RunType.LongRun
      }, {
        name: 'Dauerlauf',
        icon: 'run--dl',
        action: RunType.Run
      }, {
        name: 'Unkategorisiert',
        icon: 'run--tdl',
        action: RunType.Uncategorized
      }, {
        name: 'Intervalle',
        icon: 'run--iv',
        action: RunType.ShortIntervals
      }, {
        name: 'Wettkämpfe',
        icon: 'run--comp',
        action: RunType.Competition
      }]
    },
  ];

  mounted() {
    eventBus.$emit(menuEvents.set_State, 'Alle Aktivitäten');

    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }

    eventBus.$on(modalEvents.open_Modal, () => {
      this.showModal = true;
    });

    eventBus.$on(modalEvents.close_Modal, () => {
      this.showModal = false;
    });

    eventBus.$on(modalEvents.close_Modal_With_Callback, (item) => {
      this.showModal = false;
      let range = {
        end: new Date(item.end),
        start: new Date(item.start),
      };

      console.log(range);

      eventBus.$emit(menuEvents.set_State, formatDate(range.start, FormatDate.Day) + ' - ' + formatDate(range.end, FormatDate.Day));
      this.$store.dispatch(MutationTypes.SET_TIME_RANGE, {
        rangeType: TimeRangeType.Individual,
        range: range,
      });
    });

    eventBus.$on(BottomMenuEvents.set_Selected_Menu, (i) => {
      this.selectedMenu = i;
    });

    eventBus.$on(BottomMenuEvents.dispatch_Overlay_Click, (payload) => {
      switch (payload.menu) {
        case 0:
          let range = null;
          if (payload.payload === TimeRangeType.Individual) {
            /*range = {
              end: new Date(),
              start: new Date('2018-06-09'),
            };*/
            this.showModal = true;
          } else {
            eventBus.$emit(menuEvents.set_State, 'Alle Aktivitäten');
            this.$store.dispatch(MutationTypes.SET_TIME_RANGE, {
              rangeType: payload.payload,
              range: range,
            });
          }
          break;
        case 1:
          this.$store.dispatch(MutationTypes.SET_SELECTED_RUNTYPE, payload.payload);
          break;
      }
    });
  }
}
