/* tslint:disable */
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';


@Component({
  template: require('./compareBox.html'),
})
export class CompareBox extends Vue {
  @Prop()
  value: string;

  @Prop()
  unit: string;

  @Prop()
  label: string;

  mounted() {
  }
}
