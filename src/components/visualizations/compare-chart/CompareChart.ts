/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {LoadingStatus, loadingStatus} from '../../../models/App/AppStatus';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';
import {formatDistance} from '../../../utils/format-data';
import {FormatDistanceType} from '../../../models/FormatModel';
import {CategoryOpacity} from '../../../models/VisualVariableModel';
import {PositionModel} from '../../../models/Chart/ChartModels';
import {getPercentageFromValue} from '../../../utils/numbers/numbers';

@Component({
  template: require('./compareChart.html'),
})
export class CompareChart extends Vue {

  @Prop()
  root: string;

  @Prop()
  data: any[];

  @Prop()
  loadingStatus: LoadingStatus;

  @Watch('data')
  @Watch('loadingStatus.activities')
  @Watch('trainingCluster')
  @Watch('longestDistance')
  @Watch('longestDistanceTotal')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
    }
  }

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      console.log(this.root);
      console.log(this.data);
      console.log('--------');
    }
  }
}
