/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {FilterModel} from '../../../models/Filter/FilterModel';
import {ArcCompare} from '../../charts/ArcCompare';
import {CompareListItem} from '../../partials/CompareListItem';
import {getDataToCompare} from '../../../utils/compareData/compareData';
import {loadingStatus} from '../../../models/App/AppStatus';

@Component({
  template: require('./compareModule.html'),
  components: {
    'arcCompare': ArcCompare,
    'compareListItem': CompareListItem
  }
})
export class CompareModule extends Vue {
  @Prop()
  index: number;

  @Prop()
  trainingCluster: string;

  @Prop()
  filter: FilterModel;

  @Prop()
  data: Object;

  @Prop()
  loadingStatus: any;

  private sortedData: any = null;
  private trainingClusterDetail: any = null;

  @Watch('data')
  @Watch('loadingStatus.activities')
  @Watch('filter.selectedRunType')
  @Watch('filter.selectedCluster')
  @Watch('filter.selectedTrainingCluster')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.sortedData = getDataToCompare(this.trainingCluster, this.data);
      this.trainingClusterDetail = this.$store.getters.getCluster(this.trainingCluster);
    }
  }
}
