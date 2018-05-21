import {Component, Prop} from 'vue-property-decorator';
import Vue from 'vue';
import {TrainChart} from '../../charts/TrainChart';
import {LoadingStatus} from '../../../models/App/AppStatus';
import {RunType} from '../../../store/state';

@Component({
  template: require('./trainCompareModule.html'),
  components: {
    'trainChart': TrainChart,
  },
})
export class TrainCompareModule extends Vue {
  @Prop()
  root: string;

  @Prop()
  anchors: string[];

  @Prop()
  preparation: string;

  @Prop()
  loadingStatus: LoadingStatus;

  @Prop()
  selectedRunType: RunType;
}
