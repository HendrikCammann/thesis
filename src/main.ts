import Vue from 'vue';
import { sync } from 'vuex-router-sync';
import router from './router';
import store from './store/index';

// import styles
import './styles/main.scss';
import {formatDistance, formatPace} from './utils/format-data';
import {FormatDistanceType, FormatPaceType} from './models/FormatModel';
import {NavigationModule} from './components/ui-widgets/navigation';

sync(store, router);

export const eventBus = new Vue();

Vue.filter('formatDistance', function (value) {
  if (!value) return '';
  return formatDistance(value, FormatDistanceType.Kilometers).toFixed(2);
});

Vue.filter('formatPace', function (value) {
  if (!value) return '';
  return formatPace(value, FormatPaceType.MinPerKm).formattedVal;
});

Vue.filter('round', function (value) {
  if (!value) return '';
  return Math.round(value);
});

new Vue({
  el: '#app-main',
  store,
  router: router,
  components: {
    'navigationModule': NavigationModule,
  }
});
