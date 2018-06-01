/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {Toggle} from '../../partials/Toggle';
import {ActivityRunList} from '../ActivityRunList';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {eventBus} from '../../../main';
import {detailEvents} from '../../../events/Detail/detail';
import {DisplayType} from '../../../store/state';

@Component({
  template: require('./activityGraphs.html'),
  components: {
    'toggleModule': Toggle,
    'runList': ActivityRunList,
  }
})
export class ActivityGraphs extends Vue {
  @Prop()
  public loaded: LoadingStatus;

  @Prop()
  public activity: any;

  public runListdata = null;

  public toggleOptions = ['Runden', 'Kilometer'];
  public selectedOption = 0;

  public selectedType = DisplayType.Heartrate;

  @Watch('loaded.activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loaded.activities === loadingStatus.Loaded) {
      this.initRunListData(this.activity);
    }
  }

  private initRunListData(activity) {
    if (this.selectedOption === 0) {
      this.runListdata = activity.details.laps;
    } else {
      this.runListdata = activity.details.splits.metric;
    }
  }

  mounted() {
    if (this.loaded.activities === loadingStatus.Loaded) {
      this.initRunListData(this.activity);
    }

    eventBus.$on(detailEvents.selected_lap_type, (index) => {
      this.selectedOption = index;
      this.initRunListData(this.activity);
    })
  }
}