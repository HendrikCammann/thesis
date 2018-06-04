/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';

@Component({
  template: require('./activityZones.html'),
})
export class ActivityZones extends Vue {
  @Prop()
  label: string;
}
