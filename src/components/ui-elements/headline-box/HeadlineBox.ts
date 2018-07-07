/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {RunType} from '../../../store/state';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';

@Component({
  template: require('./headlineBox.html'),
})
export class HeadlineBox extends Vue {
  @Prop()
  headline: string;

  @Prop()
  subHeadline: string;

  @Prop()
  type: RunType;

  public get setColor() {
    return getCategoryColor(this.type);
  }

  mounted() {
  }
}
