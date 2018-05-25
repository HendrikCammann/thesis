/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {formatDistance, formatPace} from '../../../utils/format-data';
import {FormatDistanceType, FormatDurationType, FormatPaceType} from '../../../models/FormatModel';
import {formatSecondsToDuration} from '../../../utils/time/time-formatter';
import {MutationTypes} from '../../../store/mutation-types';

@Component({
  template: require('./competitionModule.html'),
})
export class CompetitionModule extends Vue {
  @Prop()
  preparation: string;

  @Prop()
  loadingStatus: LoadingStatus;

  public data: any;

  public name: string;
  public pace: string | number;
  public hr: number;
  public duration: any;
  public distance: string | number;

  public loaded: boolean = false;

  @Watch('loadingStatus.activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.getData(this.preparation);
      this.loaded = true;
    }
  }

  private getData(preparation) {
    this.data = this.$store.getters.getCluster(preparation);
    let ac = this.$store.getters.getActivity(this.data.eventId);
    this.name = ac.name;
    this.pace = formatPace(ac.average_data.speed, FormatPaceType.MinPerKm).formattedVal;
    this.hr = ac.average_data.heartrate;
    this.distance = formatDistance(ac.base_data.distance, FormatDistanceType.Kilometers).toFixed(2);
    this.duration = formatSecondsToDuration(ac.base_data.duration, FormatDurationType.Hours);
  }

  private goToActivity() {
    this.$store.dispatch(MutationTypes.SET_SELECTED_ACTIVITY, this.data.eventId);
    this.$router.push({
      path: '/activity/' + this.data.eventId
    });
  }

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.getData(this.preparation);
      this.loaded = true;
    }
  }
}
