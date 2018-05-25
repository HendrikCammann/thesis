/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {ArcCompare} from '../../charts/ArcCompare';
import {CompareListItem} from '../../partials/CompareListItem';
import {getDataToCompare} from '../../../utils/compareData/compareData';
import {loadingStatus} from '../../../models/App/AppStatus';
import {TagItem} from '../../partials/TagItem';
import {Button} from '../../partials/Button';
import {getLargerValue} from '../../../utils/numbers/numbers';

@Component({
  template: require('./compareModule.html'),
  components: {
    'arcCompare': ArcCompare,
    'compareListItem': CompareListItem,
    'button-main': Button,
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
  public longestDistance: number = null;
  public longestDistanceTotal: number = null;

  @Watch('data')
  @Watch('loadingStatus.activities')
  @Watch('trainingCluster')
  @Watch('index')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.sortedData = getDataToCompare(this.trainingCluster[this.index], this.data);
      let longestDistance = 0;
      let longestDistanceTotal = 0;
      this.trainingCluster.forEach(cluster => {
        longestDistanceTotal = getLargerValue(this.data[cluster].stats.distance, longestDistanceTotal);
        let keys = this.data[cluster].stats.typeCount;
        for (let key in keys) {
          longestDistance = getLargerValue(this.data[cluster].stats.typeCount[key].distance, longestDistance);
        }
      });
      this.longestDistance = longestDistance;
      this.longestDistanceTotal = longestDistanceTotal;
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
