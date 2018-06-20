/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {ContentBox} from '../../ui-elements/content-box';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {ClusterItem, ClusterTypes} from '../../../models/State/StateModel';
import {
  ContentBoxIcons,
  ContentBoxModel,
  getContentBoxIcon
} from '../../../models/ui-elements/content-box/ContentBoxModel';
import {eventBus} from '../../../main';
import {compareEvents} from '../../../events/Compare/compare';
import {Button} from '../../ui-elements/button';
import {MutationTypes} from '../../../store/mutation-types';
import {menuEvents} from '../../../events/Menu/menu';

@Component({
  template: require('./performanceDiagnostic.html'),
  components: {
    'content-box': ContentBox,
  }
})
export class PerformanceDiagnostic extends Vue {
  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }

    eventBus.$emit(menuEvents.set_State, 'Wettkämpfe');
  }
}
