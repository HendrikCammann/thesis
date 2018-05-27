import {Component, Prop, Watch} from 'vue-property-decorator';
import Vue from 'vue';
import {TrainChart} from '../../charts/TrainChart';
import {LoadingStatus} from '../../../models/App/AppStatus';
import {DisplayType, RunType} from '../../../store/state';
import {CompetitionModule} from '../CompetitionModule';

@Component({
  template: require('./trainCompareModule.html'),
  components: {
    'competitionModule': CompetitionModule,
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

  @Prop()
  isUnfolded: boolean;

  @Prop()
  selectedDisplayType: DisplayType;
}
