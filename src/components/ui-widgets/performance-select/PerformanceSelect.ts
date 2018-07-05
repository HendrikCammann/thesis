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
  template: require('./performanceSelect.html'),
  components: {
    'content-box': ContentBox,
  }
})
export class PerformanceSelect extends Vue {
  public contentBoxData = [
    new ContentBoxModel('Trainingseinheiten', 'Anhand von Trainingszeiten', ContentBoxIcons.Run, false, null),
    new ContentBoxModel('Wettkämpfe', 'Anhand der Bestenzeiten', ContentBoxIcons.Competition, false, null),
    new ContentBoxModel('Leistungsdiagnostik', 'Anhand gemessener Vitalparameter', ContentBoxIcons.Ldu, false, null),
  ];

  public handleSelect(i) {
    switch (i) {
      case 0:
        this.$router.push({
          path: 'performance/activities/'
        });
        break;
      case 1:
        this.$router.push({
          path: 'performance/competitions'
        });
        break;
      case 2:
        this.$router.push({
          path: 'performance/diagnostic'
        });
        break;
    }
  }

  mounted() {
    eventBus.$emit(menuEvents.set_State, 'Auswahl');
  }
}
