/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {Toggle} from '../../ui-elements/toggle';
import {eventBus} from '../../../main';
import {TrainChart} from '../../visualizations/train-chart';
import {mapGetters} from 'vuex';
import {ToggleEvents} from '../../../events/toggle/Toggle';
import {ActivitiesList} from '../activities-list';

@Component({
  template: require('./activitiesGraph.html'),
  computed: mapGetters({
    sortedLists: 'getSortedLists',
    loadingStatus: 'getAppLoadingStatus',
    selectedRunType: 'getSelectedRunType',
    selectedDisplayType: 'getSelectedDisplayType',
    showEverything: 'getShowEverything',
  }),
  components: {
    'toggle-standard': Toggle,
    'activities-list': ActivitiesList,
    'train-chart': TrainChart,
  }
})
export class ActivitiesGraph extends Vue {
  @Prop()
  cluster: any;

  public toggleData: string[] = ['Entwicklung', 'Liste'];
  public selectedToggle: number = 1;

  mounted() {
    eventBus.$on(ToggleEvents.set_Selection, (index) => {
      this.selectedToggle = index;
    })
  }
}
