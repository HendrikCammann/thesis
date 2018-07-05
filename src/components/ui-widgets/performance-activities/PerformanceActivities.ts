/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {ContentBox} from '../../ui-elements/content-box';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {ClusterItem, ClusterTypes} from '../../../models/State/StateModel';
import {
  ContentBoxIcons,
  ContentBoxModel,
  getContentBoxIcon
} from '../../../models/ui-elements/content-box/ContentBoxModel';
import {eventBus} from '../../../main';
import {compareEvents} from '../../../events/Compare/compare';
import {Button} from '../../ui-elements/button';
import {MutationTypes} from '../../../store/mutation-types';
import {menuEvents} from '../../../events/Menu/menu';
import {FormatDurationType} from '../../../models/FormatModel';
import {formatSecondsToDuration} from '../../../utils/time/time-formatter';
import {getLargerValue, getPercentageFromValue, getSmallerValue} from '../../../utils/numbers/numbers';
import {PerformanceChart} from '../../visualizations/performance-chart';
import {DistanceRangeType, TimeRangeType} from '../../../models/Filter/FilterModel';
import {RunType} from '../../../store/state';
import {BottomMenuEvents} from '../../../events/bottom-menu/bottomMenu';
import {mapGetters} from 'vuex';
import {BottomMenu} from '../bottom-menu';
import {modalEvents} from '../../../events/Modal/modal';

@Component({
  template: require('./performanceActivities.html'),
  computed: mapGetters({
    activities: 'getSortedLists',
    loadingStatus: 'getAppLoadingStatus',
    filter: 'getDashboardFilter',
    selectedRunTyp: 'getSelectedRunType',
    distanceRange: 'getDistanceRange',
    rangeType: 'getDistanceRangeType',
  }),
  components: {
    'bottom-menu': BottomMenu,
    'content-box': ContentBox,
    'performance-chart': PerformanceChart,
  }
})
export class PerformanceActivities extends Vue {
  public viewPortWidth = 0;
  public selectedMenu = null;

  public menuItems = [
    {
      name: 'Distance',
      icon: 'distance--dark',
      action: 'setDistanceRange',
      selected: 1,
      index: 0,
      items: [{
        name: 'Alle',
        icon: 'hide',
        action: DistanceRangeType.None,
      }, {
        name: '> 25km',
        icon: 'distance--light',
        action: DistanceRangeType.g25,
      }, {
        name: '> 10km',
        icon: 'distance--light',
        action: DistanceRangeType.g10,
      },{
        name: 'Eigene Distanz wählen',
        icon: 'distance--light',
        action: DistanceRangeType.Individual,
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
        icon: 'run--ldl',
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

  public getViewportWidth() {
    this.viewPortWidth = document.getElementsByClassName('performanceActivities__content')[0].clientWidth;
  }

  public performanceData = null;
  public initData() {
    let distanceRange = this.$store.getters.getDistanceRange;
    let runType = this.$store.getters.getSelectedRunType;
    let data = this.$store.getters.getActivities;
    let arr = [];
    data.forEach((item, i) => {
      if (item.base_data.distance > distanceRange.start && item.base_data.distance < distanceRange.end) {
        if (item.categorization.activity_type === runType || runType === RunType.All) {
          arr.push(item);
        }
      }
    });

    let bestTime = 0;
    let minTime = 10000000000;
    let highestHR = 200;
    arr.forEach(item => {
      bestTime = getLargerValue(item.average_data.speed, bestTime);
      minTime = getSmallerValue(item.average_data.speed, minTime);
    });
    minTime *= 0.8;

    let items = [];
    arr.forEach(item => {
      let hr = 0;
      if (item.average_data.heartrate) {
        hr = getPercentageFromValue(item.average_data.heartrate, highestHR) / 100;
      }

      let pace = getPercentageFromValue(item.average_data.speed, bestTime) / 100;

      items.push({
        item: item,
        hrBar: hr,
        paceBar: pace,
      });
    });
    return items;
  }

  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }

    window.addEventListener('resize', this.getViewportWidth, true);
    this.viewPortWidth = document.getElementsByClassName('performanceActivities__content')[0].clientWidth;

    this.performanceData = this.initData();

    eventBus.$emit(menuEvents.set_State, 'Trainingseinheiten');

    eventBus.$on(BottomMenuEvents.set_Selected_Menu, (i) => {
      this.selectedMenu = i;
    });

    eventBus.$on(modalEvents.close_Modal_With_Callback, (item) => {
      eventBus.$emit(modalEvents.close_Modal);
      let range = {
        end: item.end,
        start: item.start,
      };
      this.$store.dispatch(MutationTypes.SET_DISTANCE_RANGE, {
        rangeType: TimeRangeType.Individual,
        range: range,
      });
      this.performanceData = this.initData();
    });

    eventBus.$on(BottomMenuEvents.dispatch_Overlay_Click, (payload) => {
      switch (payload.menu) {
        case 0:
          let range = null;
          if (payload.payload === TimeRangeType.Individual) {
            eventBus.$emit(modalEvents.open_Modal, true);
          } else {
            this.$store.dispatch(MutationTypes.SET_DISTANCE_RANGE, {
              rangeType: payload.payload,
              range: range,
            });
            this.performanceData = this.initData();
          }
          break;
        case 1:
          this.$store.dispatch(MutationTypes.SET_SELECTED_RUNTYPE, payload.payload);
          this.performanceData = this.initData();
          break;
      }
    });
  }
}
