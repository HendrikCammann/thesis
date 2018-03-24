import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {State} from '../../../store/state';
import {mapGetters} from 'vuex';
import { LineChart } from '../../../components/modules/LineChart/';

/* tslint:disable */
@Component({
  template: require('./activity.html'),
  computed: mapGetters({
    getSelectedActivity: 'getSelectedActivity',
    getSelectedActivityStreams: 'getSelectedActivityStreams',
  }),
  components: {
    'linechart': LineChart
  }
})
export class ActivityContainer extends Vue {
  mounted() {
    this.$store.dispatch(MutationTypes.GET_ACTIVITY, this.$store.getters.getSelectedActivityId);
    this.$store.dispatch(MutationTypes.GET_ACTIVITY_STREAMS, this.$store.getters.getSelectedActivityId);
  }

}
