/* tslint:disable */
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';

@Component({
  template: require('./mapOverlayItem.html'),
})
export class MapOverlayItem extends Vue {
  @Prop()
  value: string;

  @Prop()
  label: string;

  @Prop()
  illustration: string;

  get imagePath() {
    return require('../../../assets/illustrations/' + this.illustration + '.svg')
  }
}
