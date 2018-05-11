import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {loadingStatus} from '../../../models/App/AppStatus';
import {UserModule} from '../../modules/UserModule';
import {mapGetters} from 'vuex';

import {CanvasConstraints} from '../../../models/VisualVariableModel';
import {DayModule} from '../../modules/DayModule';
import {WaveChart} from '../../charts/WaveChart';

@Component({
  template: require('./dashboard.html'),
  computed: mapGetters({
    user: 'getAthlete',
    sortedActivities: 'getSortedActivities',
    filter: 'getDashboardFilter',
  }),
  components: {
    'userModule': UserModule,
    'dayModule': DayModule,
    'waveChart': WaveChart,
  }
})
export class Dashboard extends Vue {

  public canvasConstraints = new CanvasConstraints(0, 420, 300, 50, 1, 5);

  mounted() {
    if (this.$store.getters.getAppLoadingStatus.athlete === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_ATHLETE_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ATHLETE);
    }

    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }
  }
}
