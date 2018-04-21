/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {TitleBox} from '../../partials/TitleBox';
import {UserModel} from '../../../models/User/UserModel';

@Component({
  template: require('./userModule.html'),
  components: {
    'titleBox': TitleBox,
  }
})
export class UserModule extends Vue {
  @Prop()
  user: UserModel;

  @Watch('user')
  onPropertyChanged(val: any, oldVal: any) {
  }

}
