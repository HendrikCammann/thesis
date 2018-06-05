/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {Toggle} from '../../ui-elements/toggle';
import {eventBus} from '../../../main';
import {ToggleEvents} from '../../../events/toggle/Toggle';
import {modalEvents} from '../../../events/Modal/modal';
import {LoadingStatus, loadingStatus} from '../../../models/App/AppStatus';
import {formatPace} from '../../../utils/format-data';
import {FormatPaceType} from '../../../models/FormatModel';
import {getLargerValue, getPercentageFromValue} from '../../../utils/numbers/numbers';
import {ActivityDetailsList} from '../activity-details-list';

@Component({
  template: require('./activityDetails.html'),
  components: {
    'toggleStandard': Toggle,
    'detailList': ActivityDetailsList,
  }
})
export class ActivityDetails extends Vue {
  @Prop()
  loaded: LoadingStatus;

  @Prop()
  activity: any;

  public toggleData: string[] = ['Kilometer', 'Runden'];
  public selectedToggle: number = 0;

  private listData = null;

  @Watch('loaded.activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loaded.activities === loadingStatus.Loaded) {
      this.listData = this.initData(this.activity);
      console.log(this.listData);
    }
  }

  private initData(activity) {
    let data;
    if (this.selectedToggle === 0) {
      data = activity.details.splits.metric;
    } else {
      data = activity.details.laps;
    }

    let listData = [];
    let maxPace = 0;
    let maxHr = 0;
    let totalDistance = 0;
    data.forEach(item => {
      let distance = Math.round(item.distance / 10) * 10;
      totalDistance += distance;
      let pace = item.average_speed;
      let paceFormatted = formatPace(pace, FormatPaceType.MinPerKm).formattedVal + '/km';
      maxPace = getLargerValue(item.average_speed, maxPace);
      let hr = 0;
      let hrFormatted = '-';
      if (item.average_heartrate) {
        hr = item.average_heartrate;
        hrFormatted = Math.round(hr) + 'bpm';
        maxHr = getLargerValue(hr, maxHr);
      }

      listData.push({
        distance: distance,
        distanceFormatted: distance / 1000 + 'km',
        distanceTotal: totalDistance,
        distanceTotalFormatted: totalDistance / 1000 + 'km',
        pace: pace,
        paceFormatted: paceFormatted,
        paceLength: null,
        hr: hr,
        hrFormatted: hrFormatted,
        hrLength: null,
      })
    });

    listData.forEach(item => {
      item.paceLength = getPercentageFromValue(item.pace, maxPace);
      item.hrLength = 0;

      if (item.hr !== 0) {
        item.hrLength = getPercentageFromValue(item.hr - 80, maxHr - 80);
      }
    });

    return listData;
  }

  mounted() {
    if (this.loaded.activities === loadingStatus.Loaded) {
      this.listData = this.initData(this.activity);
      console.log(this.listData);
    }

    eventBus.$on(ToggleEvents.set_Selection, (index) => {
      this.selectedToggle = index;
      this.listData = this.initData(this.activity);
    });
  }
}
