/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';

@Component({
  template: require('./activityStatsItem.html'),
})
export class ActivityStatsItem extends Vue {
  @Prop()
  value: string;

  @Prop()
  label: string;

  @Prop()
  image: string;

  get imagePath() {
    return require('../../../assets/icons/' + this.image + '.svg');
  }
}
