/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';

@Component({
  template: require('./button.html'),
})
export class Button extends Vue {
  @Prop()
  label: string;
}
