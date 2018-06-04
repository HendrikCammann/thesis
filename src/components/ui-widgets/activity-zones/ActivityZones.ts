/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {ZoneChart} from '../../visualizations/zone-chart';

@Component({
  template: require('./activityZones.html'),
  components: {
    'zoneChart': ZoneChart,
  }
})
export class ActivityZones extends Vue {
  @Prop()
  zones: any;

  mounted() {
    console.log(this.zones);
  }
}
