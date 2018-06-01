import {Component, Prop, Watch} from 'vue-property-decorator';
import Vue from 'vue';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {formatDistance, formatPace} from '../../../utils/format-data';
import {FormatDistanceType, FormatDurationType, FormatPaceType} from '../../../models/FormatModel';
import {formatSecondsToDuration} from '../../../utils/time/time-formatter';
import {ActivityStatsItem} from '../../partials/ActivityStatsItem';

@Component({
  template: require('./activityStats.html'),
  components: {
    'stat-item': ActivityStatsItem,
  }
})
export class ActivityStatsModule extends Vue {
  @Prop()
  loaded: LoadingStatus;

  @Prop()
  activity: any;

  public data: any = null;

  @Watch('loaded.activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loaded.activities === loadingStatus.Loaded) {
      this.data = this.initData(this.activity);
    }
  }

  private initData(activity) {
    return {
      distance: formatDistance(activity.base_data.distance, FormatDistanceType.Kilometers).toFixed(2) + 'km',
      duration: formatSecondsToDuration(activity.base_data.duration, FormatDurationType.Dynamic).multilple,
      elevation: activity.base_data.elevation_gain + 'm',
      pace: formatPace(activity.average_data.speed, FormatPaceType.MinPerKm).formattedVal + '/km',
      heartrate: activity.average_data.heartrate + 'bpm',
      intensity: 0 + '',
    };
  }

  mounted() {
    if (this.loaded.activities === loadingStatus.Loaded) {
      this.data = this.initData(this.activity);
    }
  }
}
