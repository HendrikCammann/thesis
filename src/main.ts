import Vue from 'vue';
import { sync } from 'vuex-router-sync';
import router from './router';
import store from './store/index';
import { Navbar } from './components/modules/Navbar/';

// import styles
import './styles/main.scss';
import {formatDistance} from './utils/format-data';
import {FormatDistanceType} from './models/FormatModel';

sync(store, router);

export const filterBus = new Vue();

Vue.filter('formatDistance', function (value) {
  if (!value) return '';
  return formatDistance(value, FormatDistanceType.Kilometers).toFixed(2) + 'km';
});

new Vue({
  el: '#app-main',
  store,
  router: router,
  components: {
    'navbar': Navbar,
  }
});
