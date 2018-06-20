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
import {BottomMenu} from '../bottom-menu';
import {DashboardViewType} from '../../../store/state';
import {formatSecondsToDuration} from '../../../utils/time/time-formatter';
import {formatPace} from '../../../utils/format-data';
import {FormatDurationType, FormatPaceType} from '../../../models/FormatModel';
import {getLargerValue, getPercentageFromValue, getSmallerValue} from '../../../utils/numbers/numbers';
import {PerformanceChart} from '../../visualizations/performance-chart';

@Component({
  template: require('./performanceCompetition.html'),
  components: {
    'bottom-menu': BottomMenu,
    'content-box': ContentBox,
    'performance-chart': PerformanceChart,
  }
})
export class PerformanceCompetition extends Vue {
  public viewPortWidth = 0;
  public selected = ClusterTypes.Halfmarathon;
  public menuItems = [
    {
      name: '10km',
      icon: 'running--gray',
      action: ClusterTypes.TenK
    },
    {
      name: 'Halbmarathon',
      icon: 'running--gray',
      action: ClusterTypes.Halfmarathon
    },
    {
      name: 'Marathon',
      icon: 'running--gray',
      action: ClusterTypes.Marathon
    },
  ];

  public performanceData = null;
  public competitionBoxes = [];

  public initData(type: ClusterTypes) {
    let filterTreshhold = {
      max: 1000,
      min: 1000,
    };

    switch(type) {
      case ClusterTypes.TenK:
        filterTreshhold.max *= 11;
        filterTreshhold.max *= 9;
        break;
      case ClusterTypes.Halfmarathon:
        filterTreshhold.max *= 23;
        filterTreshhold.min *= 20;
        break;
      case ClusterTypes.Marathon:
        filterTreshhold.min *= 38;
        filterTreshhold.max *= 44;
        break;
    }

    let data = this.$store.getters.getCompetitions;
    let arr = [];
    data.forEach(item => {
      if (item.base_data.distance > filterTreshhold.min && item.base_data.distance < filterTreshhold.max) {
        arr.push(item);
        this.competitionBoxes.push(new ContentBoxModel(formatSecondsToDuration(item.base_data.duration, FormatDurationType.Dynamic).all, item.name, ContentBoxIcons.Competition, false, null));
      }
    });

    let bestTime = 10000000000000000;
    let minTime = 0;
    let highestHR = 200;
    arr.forEach(item => {
      bestTime = getSmallerValue(item.base_data.duration, bestTime);
      minTime = getLargerValue(item.base_data.duration, minTime);
    });
    minTime *= 1.2;

    let items = [];
    arr.forEach(item => {
      let hr = 0;
      if (item.average_data.heartrate) {
        hr = getPercentageFromValue(item.average_data.heartrate, highestHR) / 100;
      }

      let pace = Math.abs(((item.base_data.duration - minTime) * 100) / (bestTime - minTime)) / 100;

      items.push({
        item: item,
        hrBar: hr,
        paceBar: pace,
      });
    });
    return items;
  }

  public getViewportWidth() {
    this.viewPortWidth = document.getElementsByClassName('performanceCompetition__content')[0].clientWidth;
  }

  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }

    window.addEventListener('resize', this.getViewportWidth, true);
    this.viewPortWidth = document.getElementsByClassName('performanceCompetition__content')[0].clientWidth;

    this.performanceData = this.initData(this.selected);

    console.log(this.$store.getters.getCompetitions);
    eventBus.$emit(menuEvents.set_State, 'Wettkämpfe');
  }
}
