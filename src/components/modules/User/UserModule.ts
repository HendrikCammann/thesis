import {Component, Prop, Watch} from 'vue-property-decorator';
import Vue from 'vue';

@Component({
  template: require('./user.html'),
})
export class UserModule extends Vue {
  @Prop()
  public headline: string;

  @Prop()
  public label: string;

  @Prop()
  public image: string;
}
