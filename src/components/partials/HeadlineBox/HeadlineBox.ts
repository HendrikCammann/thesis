/* tslint:disable */
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';

@Component({
  template: require('./headlineBox.html'),
})
export class HeadlineBox extends Vue {
  @Prop()
  headline: string;

  @Prop()
  subHeadline: string;

  @Prop()
  illustration: string;

  @Prop()
  isSubTitle: boolean;

  get imagePath() {
    return require('../../../assets/illustrations/' + this.illustration + '.svg')
  }
}