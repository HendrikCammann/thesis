import {Component, Prop, Watch} from 'vue-property-decorator';
import Vue from 'vue';
import {ZoneChart} from '../../charts/ZoneChart';
import {ActivityZoneModel} from '../../../models/Activity/ActivityZoneModel';

@Component({
  template: require('./zoneModule.html'),
  components: {
    'zoneChart': ZoneChart,
  },
})
export class ZoneModule extends Vue {
  @Prop()
  zones: ActivityZoneModel | any;
}
