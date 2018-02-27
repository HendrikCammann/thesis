import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {State} from '../../../store/state';
import {mapGetters} from 'vuex';

@Component({
  template: require('./activity.html'),
  computed: mapGetters([
    'getSelectedActivity'
  ])
})
export class ActivityContainer extends Vue {
  mounted() {
    this.$store.dispatch(MutationTypes.GET_ACTIVITY, this.$store.getters.getSelectedActivityId);
    this.$store.dispatch(MutationTypes.GET_ACTIVITY_STREAMS, this.$store.getters.getSelectedActivityId);
  }
}
