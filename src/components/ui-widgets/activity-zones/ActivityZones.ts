/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {ZoneChart} from '../../visualizations/zone-chart';
import {TextBox} from '../../ui-elements/text-box';
import {ActivityZoneList} from '../activity-zone-list';

@Component({
  template: require('./activityZones.html'),
  components: {
    'zoneChart': ZoneChart,
    'zoneList': ActivityZoneList,
    'textBox': TextBox,
  }
})
export class ActivityZones extends Vue {
  @Prop()
  zones: any;

  mounted() {
  }
}
