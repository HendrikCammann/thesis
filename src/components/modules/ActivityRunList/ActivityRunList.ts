/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {loadingStatus} from '../../../models/App/AppStatus';
import {formatDistance, formatPace} from '../../../utils/format-data';
import {FormatDistanceType, FormatPaceType} from '../../../models/FormatModel';
import {getLargerValue} from '../../../utils/numbers/numbers';
import {ActivityRunListItem} from '../../partials/ActivityRunListItem';
import {DisplayType} from '../../../store/state';

@Component({
  template: require('./activityRunList.html'),
  components: {
    'runListItem': ActivityRunListItem,
  }
})
export class ActivityRunList extends Vue {
  @Prop()
  data: any[];

  @Prop()
  selectedType: DisplayType;

  public formattedData = null;

  @Watch('data')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.data !== null) {
      this.formattedData = this.initData(this.data);
    }
  }

  private initData(data) {
    let arr = [];
    let max = {
      heartrate: 0,
      pace: 0,
      distance: 0,
    };

    data.forEach(item => {
      max.heartrate = getLargerValue(item.average_heartrate, max.heartrate);
      max.pace = getLargerValue(item.average_speed, max.pace);
      max.distance = getLargerValue(item.distance, max.distance);
      let lap = {
        heartrate: Math.round(item.average_heartrate) + 'bpm',
        distance: formatDistance(item.distance, FormatDistanceType.Kilometers).toFixed(2) + 'km',
        distanceNorm: item.distance,
        pace: formatPace(item.average_speed, FormatPaceType.MinPerKm).formattedVal + '/km',
        paceNorm: item.average_speed,
      };
      arr.push(lap);
    });

    return {
      max: max,
      data: arr,
    };
  }

  mounted() {
    if (this.data !== null) {
      this.formattedData = this.initData(this.data);
    }
  }
}
