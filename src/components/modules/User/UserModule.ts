import {Component, Prop, Watch} from 'vue-property-decorator';
import Vue from 'vue';

@Component({
  template: require('./user.html'),
})
export class UserModule extends Vue {
}
