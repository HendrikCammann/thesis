/* tslint:disable */
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';

@Component({
  template: require('./titleBox.html'),
})
export class TitleBox extends Vue {
  @Prop()
  title: string;
}
