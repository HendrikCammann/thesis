import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {RangeSlider} from '../../partials/RangeSlider';
import {SessionChart} from '../../charts/SessionChart';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';

@Component({
  template: require('./compareChartModule.html'),
  components: {
    rangeSlider: RangeSlider,
    sessionChart: SessionChart,
  }
})
export class CompareChartModule extends Vue {
  @Prop()
  data: any;

  @Prop()
  index: number;

  @Prop()
  selectedCluster: string;

  @Prop()
  loadingStatus: LoadingStatus;

  public dataStructure = null;
  private structure = 'byWeeks';

  @Watch('data')
  @Watch('loadingStatus.activities')
  @Watch('selectedCluster')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.dataStructure = this.data[this.structure];
      // console.log('can draw');
      // console.log(this.data);
      // console.log(this.selectedCluster);
      // this.historyChart('#' + this.root, this.data, this.selectedClusters, this.filterRange, this.showAbsolute)
    }
  }
}
