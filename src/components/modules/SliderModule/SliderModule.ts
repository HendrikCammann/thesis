import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {FilterModel} from '../../../models/Filter/FilterModel';

@Component({
  template: require('./sliderModule.html'),
})
export class SliderModule extends Vue {

  @Prop()
  root: string;

  @Prop()
  filter: FilterModel;

  private sliderModule(root, filter): void {
  }

  mounted() {
    this.sliderModule(this.root, this.filter);
  }
}
