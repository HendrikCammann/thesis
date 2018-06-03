/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {LoadingStatus} from '../../../models/App/AppStatus';
import {Toggle} from '../../ui-elements/toggle';
import {eventBus} from '../../../main';
import {compareEvents} from '../../../events/Compare/compare';
import {TrainChart} from '../../visualizations/train-chart';
import {mapGetters} from 'vuex';

@Component({
  template: require('./compareGraph.html'),
  computed: mapGetters({
    selectedTrainingClusters: 'getSelectedTrainingClusters',
    loaded: 'getAppLoadingStatus',
    selectedRunType: 'getSelectedRunType',
    selectedDisplayType: 'getSelectedDisplayType',
    showEverything: 'getShowEverything',
  }),
  components: {
    'toggle-standard': Toggle,
    'train-chart': TrainChart,
  }
})
export class CompareGraph extends Vue {
  @Prop()
  clusters: any[];

  @Prop()
  loadingStatus: LoadingStatus;

  public toggleData: string[] = [];
  public selectedToggle: number = 0;

  public chartData = null;

  private initToggleData(clusters) {
    this.clusters.forEach(cluster => {
      this.toggleData.push(cluster.name);
    });
  }

  private initChartData(clusters, selectedToggle) {
    this.chartData = clusters[selectedToggle].data;
  }

  mounted() {
    this.initToggleData(this.clusters);
    this.initChartData(this.clusters, this.selectedToggle);
    eventBus.$on(compareEvents.changed_ClusterView, (index) => {
      this.selectedToggle = index;
      this.initChartData(this.clusters, this.selectedToggle);
    })
  }
}
