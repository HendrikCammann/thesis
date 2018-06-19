/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {Toggle} from '../../ui-elements/toggle';
import {eventBus} from '../../../main';
import {ToggleEvents} from '../../../events/toggle/Toggle';
import {LoadingStatus, loadingStatus} from '../../../models/App/AppStatus';
import {formatPace} from '../../../utils/format-data';
import {FormatPaceType} from '../../../models/FormatModel';
import {getLargerValue, getPercentageFromValue} from '../../../utils/numbers/numbers';
import {ActivityDetailsList} from '../activity-details-list';
import {LineChart} from '../../visualizations/line-chart';

@Component({
  template: require('./activityDetails.html'),
  components: {
    'toggleStandard': Toggle,
    'detailList': ActivityDetailsList,
    'detailGraph': LineChart,
  }
})
export class ActivityDetails extends Vue {
  @Prop()
  loaded: LoadingStatus;

  @Prop()
  activity: any;

  public toggleData: string[] = ['Kilometer', 'Runden'];
  public selectedToggle: number = 0;

  private listData = null;
  private graphData = null;

  public scrolling;
  public fadeToggle = false;

  @Watch('loaded.activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loaded.activities === loadingStatus.Loaded) {
      this.listData = this.initListData(this.activity);
      this.graphData = this.initGraphData(this.activity);
    }
  }

  private initListData(activity) {
    let data;
    if (this.selectedToggle === 0) {
      data = activity.details.splits.metric;
    } else {
      data = activity.details.laps;
    }

    let listData = [];
    let maxPace = 0;
    let maxHr = 0;
    let totalDistance = 0;
    data.forEach(item => {
      let distance = Math.round(item.distance / 10) * 10;
      totalDistance += distance;
      let pace = item.average_speed;
      let paceFormatted = formatPace(pace, FormatPaceType.MinPerKm).formattedVal + '/km';
      maxPace = getLargerValue(item.average_speed, maxPace);
      let hr = 0;
      let hrFormatted = '-';
      if (item.average_heartrate) {
        hr = item.average_heartrate;
        hrFormatted = Math.round(hr) + 'bpm';
        maxHr = getLargerValue(hr, maxHr);
      }

      listData.push({
        distance: distance,
        distanceFormatted: distance / 1000 + 'km',
        distanceTotal: totalDistance,
        distanceTotalFormatted: totalDistance / 1000 + 'km',
        pace: pace,
        paceFormatted: paceFormatted,
        paceLength: null,
        hr: hr,
        hrFormatted: hrFormatted,
        hrLength: null,
      })
    });

    listData.forEach(item => {
      item.paceLength = getPercentageFromValue(item.pace, maxPace);
      item.hrLength = 0;

      if (item.hr !== 0) {
        item.hrLength = getPercentageFromValue(item.hr - 80, maxHr - 80);
      }
    });

    return listData;
  }

  private initGraphData(activity) {
    let distanceValues = activity.streams.distance.data;
    let paceValues = activity.streams.speed.data;
    let avgPace = activity.average_data.speed;
    let maxPace = activity.max_Data.speed;
    let hrValues = null;
    let avgHr = null;
    let maxHr = null;
    if (activity.streams.heartrate) {
      hrValues = activity.streams.heartrate.data;
      avgHr = activity.average_data.heartrate;
      maxHr = activity.max_Data.heartrate;
    }

    return {
      distanceValues: distanceValues,
      paceValues: paceValues,
      avgPace: avgPace,
      maxPace: maxPace,
      hrValues: hrValues,
      avgHr: avgHr,
      maxHr: maxHr,
    };
  }

  public handleScroll() {
    window.clearTimeout( this.scrolling );
    this.fadeToggle = true;
    let that = this;
    // Set a timeout to run after scrolling ends
    this.scrolling = setTimeout(function() {

      // Run the callback
      console.log( 'Scrolling has stopped.' );
      that.fadeToggle = false;

    }, 66);
  }

  mounted() {
    window.addEventListener('scroll', this.handleScroll);

    if (this.loaded.activities === loadingStatus.Loaded) {
      this.listData = this.initListData(this.activity);
      this.graphData = this.initGraphData(this.activity);
    }

    eventBus.$on(ToggleEvents.set_Selection, (index) => {
      this.selectedToggle = index;
      this.listData = this.initListData(this.activity);
      this.graphData = this.initGraphData(this.activity);
    });
  }

  destroyed() {
    window.removeEventListener('scroll', this.handleScroll);
  }
}
