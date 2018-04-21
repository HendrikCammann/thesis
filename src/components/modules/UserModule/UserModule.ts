/* tslint:disable */
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';
import {TitleBox} from '../../partials/TitleBox';

@Component({
  template: require('./userModule.html'),
  components: {
    'titleBox': TitleBox,
  }
})
export class UserModule extends Vue {
}
