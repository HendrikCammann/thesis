/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {eventBus} from '../../../main';
import {compareEvents} from '../../../events/Compare/compare';
import {ToggleEvents} from '../../../events/toggle/Toggle';
import {ActivityZoneModel} from '../../../models/Activity/ActivityZoneModel';
import {formatSecondsToDuration} from '../../../utils/time/time-formatter';
import {FormatDurationType, FormatPaceType} from '../../../models/FormatModel';
import {formatPace} from '../../../utils/format-data';

class ListItem {
  value: number | string;
  label: string;
  zone: number;
  icon: string;

  constructor(value, label, zone, icon) {
    this.value = value;
    this.label = label;
    this.zone = zone;
    this.icon = icon;
  }
}

@Component({
  template: require('./activityZoneList.html'),
})
export class ActivityZoneList extends Vue {
  @Prop()
  zones: ActivityZoneModel | any;

  private listData = null;

  mounted() {
    this.listData = this.initData(this.zones);
  }

  private getRange(min, max, isPace) {
    let paceRange;
    if (isPace) {
      if (min === 0) {
        paceRange = '> ' + formatPace(max, FormatPaceType.MinPerKm).formattedVal + '/km';
      } else if (max === -1) {
        paceRange = '< ' + formatPace(min, FormatPaceType.MinPerKm).formattedVal + '/km';
      } else {
        paceRange = formatPace(min, FormatPaceType.MinPerKm).formattedVal + ' - ' + formatPace(max, FormatPaceType.MinPerKm).formattedVal + '/km';
      }
    } else {
      if (min === 0) {
        paceRange = '< ' + max + '/bpm';
      } else if (max === -1) {
        paceRange = '> ' + min + '/bpm';
      } else {
        paceRange = min + ' - ' + max + '/km';
      }
    }
    return paceRange;
  }

  private initData(zones) {
    let zonesData = [];
    for (let i = 0; i < zones.pace.distribution_buckets.length; i++) {
      let index = i + 1;
      let paceDuration = formatSecondsToDuration(zones.pace.distribution_buckets[i].time, FormatDurationType.Dynamic).all;
      let paceRange = this.getRange(zones.pace.distribution_buckets[i].min, zones.pace.distribution_buckets[i].max, true);

      let hrDuration = '-';
      let hrRange = '-';

      if(zones.heartrate) {
        hrDuration = formatSecondsToDuration(zones.heartrate.distribution_buckets[i].time, FormatDurationType.Dynamic).all;
        hrRange = this.getRange(zones.heartrate.distribution_buckets[i].min, zones.heartrate.distribution_buckets[i].max, false);
      }

      zonesData.push({
        index: index,
        paceDuration: paceDuration,
        paceRange: paceRange,
        hrDuration: hrDuration,
        hrRange: hrRange,
        icon: null,
      })
    }

    return zonesData;
  }
}
