/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {TitleBox} from '../../partials/TitleBox';

@Component({
  template: require('./userModule.html'),
  components: {
    'titleBox': TitleBox,
  }
})
export class UserModule extends Vue {
  @Prop()
  user: any;

  @Watch('user')
  onPropertyChanged(val: any, oldVal: any) {
    console.log(this.user);
  }

}
