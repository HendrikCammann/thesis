import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {loadingStatus} from '../../../models/App/AppStatus';
import {UserModule} from '../../modules/UserModule';
import {mapGetters} from 'vuex';

@Component({
  template: require('./dashboard.html'),
  computed: mapGetters({
    user: 'getAthlete'
  }),
  components: {
    'userModule': UserModule,
  }
})
export class Dashboard extends Vue {
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
