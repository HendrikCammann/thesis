/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';

@Component({
  template: require('./textBox.html'),
})
export class TextBox extends Vue {
  @Prop()
  text: string;

  mounted() {
  }
}
