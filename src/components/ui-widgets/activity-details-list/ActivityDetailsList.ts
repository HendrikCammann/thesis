/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';

@Component({
  template: require('./activityDetailsList.html'),
})
export class ActivityDetailsList extends Vue {
  @Prop()
  data: any[];

  mounted() {

  }
}
