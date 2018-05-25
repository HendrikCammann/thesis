/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {ArcCompare} from '../../charts/ArcCompare';
import {CompareListItem} from '../../partials/CompareListItem';
import {getDataToCompare} from '../../../utils/compareData/compareData';
import {loadingStatus} from '../../../models/App/AppStatus';
import {TagItem} from '../../partials/TagItem';

@Component({
  template: require('./compareModule.html'),
  components: {
    'arcCompare': ArcCompare,
    'compareListItem': CompareListItem,
    'tagItem': TagItem
  }
})
export class CompareModule extends Vue {
  @Prop()
  index: number;

  @Prop()
  trainingCluster: string[];

  @Prop()
  data: Object;

  @Prop()
  loadingStatus: any;

  public type: string = 'Halbmarathon';

  public sortedData: any = null;
  public trainingClusterDetail: any = null;

  @Watch('data')
  @Watch('loadingStatus.activities')
  @Watch('trainingCluster')
  @Watch('index')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.sortedData = getDataToCompare(this.trainingCluster[this.index], this.data);
      this.trainingClusterDetail = this.$store.getters.getCluster(this.trainingCluster[this.index]);
    }
  }

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.sortedData = getDataToCompare(this.trainingCluster[this.index], this.data);
      this.trainingClusterDetail = this.$store.getters.getCluster(this.trainingCluster[this.index]);
    }
  }
}
