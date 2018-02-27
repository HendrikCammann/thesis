import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';


@Component({
  template: require('./app.html')
})
export class AppContainer extends Vue {

  package: string = 'vue-vuex-boillerplate';
  logo: string = '../assets/images/logo.png';
  repo: string = 'https://github.com/bamboo-c/vue-vuex-boilerplate';
  mode: string = process.env.ENV;

  mounted() {
  }

}
