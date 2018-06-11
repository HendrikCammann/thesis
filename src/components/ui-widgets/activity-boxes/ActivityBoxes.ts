/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {eventBus} from '../../../main';
import {compareEvents} from '../../../events/Compare/compare';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {ContentBoxIcons, ContentBoxModel} from '../../../models/ui-elements/content-box/ContentBoxModel';
import {formatDistance, formatPace} from '../../../utils/format-data';
import {FormatDistanceType, FormatDurationType, FormatPaceType} from '../../../models/FormatModel';
import {formatSecondsToDuration} from '../../../utils/time/time-formatter';
import {ContentBox} from '../../ui-elements/content-box';
import {TextBox} from '../../ui-elements/text-box';
import {Button} from '../../ui-elements/button';

@Component({
  template: require('./activityBoxes.html'),
  components: {
    'content-box': ContentBox,
    'text-box': TextBox,
    'button-standard': Button
  }
})
export class ActivityBoxes extends Vue {
  @Prop()
  loadingStatus: LoadingStatus;

  @Prop()
  activity: any;

  public data = null;

  @Watch('loaded.activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.data = this.initData(this.activity);
    }
  }

  private initData(activity) {
    let basics = [];
    let text = [];

    let distance = formatDistance(activity.base_data.distance, FormatDistanceType.Kilometers).toFixed(2) + 'km';
    basics.push(new ContentBoxModel(distance, 'Distanz', ContentBoxIcons.Distance, false));

    let duration = formatSecondsToDuration(activity.base_data.duration, FormatDurationType.Dynamic).all;
    basics.push(new ContentBoxModel(duration, 'Dauer', ContentBoxIcons.Duration, false));

    let pace = formatPace(activity.average_data.speed, FormatPaceType.MinPerKm).formattedVal + '/km';
    basics.push(new ContentBoxModel(pace, 'ø Pace', ContentBoxIcons.Pace, false));

    let heartrate = activity.average_data.heartrate + 'bpm';
    basics.push(new ContentBoxModel(heartrate, 'ø Herzfrequenz', ContentBoxIcons.Heartrate, false));

    let intensity = Math.round(activity.base_data.intensity);
    basics.push(new ContentBoxModel(intensity, 'Intensität', ContentBoxIcons.Intensity, false));

    let feeling = '8/10';
    basics.push(new ContentBoxModel(feeling, 'Anstrengung', ContentBoxIcons.Heartrate, false));

    if (activity.details.description.length) {
      text.push(activity.details.description);
    } else {
      text.push('Keine Beschreibung hinzugefügt');
    }

    return {
      basics: basics,
      text: text,
    }
  }

  mounted() {
    this.data = this.initData(this.activity);
  }
}
