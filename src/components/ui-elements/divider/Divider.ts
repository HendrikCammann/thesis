/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';

@Component({
  template: require('./divider.html'),
})
export class Divider extends Vue {
  @Prop()
  title: string;

  @Prop()
  color: string;

  public randomImage() {
    return Math.floor(Math.random() * (4 - 1 + 1)) + 1;
  }
}
