import {Component, Prop, Watch} from 'vue-property-decorator';
import Vue from 'vue';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {formatDistance} from '../../../utils/format-data';
import {FormatDistanceType, FormatDurationType} from '../../../models/FormatModel';
import {formatSecondsToDuration} from '../../../utils/time/time-formatter';

@Component({
  template: require('./currentWeek.html'),
})
export class CurrentWeekModule extends Vue {
  @Prop()
  activities: any[];

  @Prop()
  loaded: LoadingStatus;

  public data: any = null;

  @Watch('loaded.activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loaded.activities === loadingStatus.Loaded) {
      this.initData(this.activities);
    }
  }

  private initData(activities: any[]) {
    let temp = {
      restdays: 0,
      sessions: 0,
      distance: '',
      duration: '',
      intensity: 0,
    };

    let duration = 0;
    let distance = 0;

    let today = new Date().getDay();
    if (today === 0) {
      today = 7;
    }

    activities.forEach((item, i) => {
      if (item.length === 0 && i < today) {
        temp.restdays++;
      } else {
        temp.sessions += item.length;
        item.forEach(ac => {
          distance += ac.base_data.distance;
          duration += ac.base_data.duration;
        });
      }
    });

    temp.distance = formatDistance(distance, FormatDistanceType.Kilometers).toFixed(2) + 'km';
    temp.duration = formatSecondsToDuration(duration, FormatDurationType.Hours).multilple;

    this.data = temp;
  }

  mounted() {
    if (this.loaded.activities === loadingStatus.Loaded) {
      this.initData(this.activities);
    }
  }
}
