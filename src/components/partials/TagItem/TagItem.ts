import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';

@Component({
  template: require('./tagItem.html'),
})
export class TagItem extends Vue {
  @Prop()
  name: string;

  @Prop()
  color: string;
}
