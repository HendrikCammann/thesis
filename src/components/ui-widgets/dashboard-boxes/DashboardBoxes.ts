/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as moment from 'moment';
import {formatDistance} from '../../../utils/format-data';
import {ContentBoxIcons, ContentBoxModel} from '../../../models/ui-elements/content-box/ContentBoxModel';
import {FormatDistanceType, FormatDurationType} from '../../../models/FormatModel';
import {formatSecondsToDuration} from '../../../utils/time/time-formatter';
import {ContentBox} from '../../ui-elements/content-box';
import {DashboardViewType} from '../../../store/state';
import {getKeys} from '../../../utils/array-helper';
import {eventBus} from '../../../main';
import {menuEvents} from '../../../events/Menu/menu';
import {loadingStatus} from '../../../models/App/AppStatus';

@Component({
  template: require('./dashboardBoxes.html'),
  components: {
    'content-box': ContentBox,
  }
})
export class DashboardBoxes extends Vue {
  @Prop()
  data: any;

  @Prop()
  viewType: DashboardViewType;

  @Prop()
  currentPreparation: string;

  public stats = null;
  public days = 0;
  public actDay = 0;
  public showDots = false;

  @Watch('viewType')
  onPropertyChanged(val: any, oldVal: any) {
    switch(this.viewType) {
      case DashboardViewType.Day:
        this.showDots = false;
        break;
      case DashboardViewType.Week:
        let keys = getKeys(this.data['All'].byWeeks);
        this.stats = this.initData(this.data['All'].byWeeks[keys[0]], this.viewType);
        this.showDots = true;
        break;
      case DashboardViewType.Month:
        let keysM = getKeys(this.data['All'].byMonths);
        this.stats = this.initData(this.data['All'].byMonths[keysM[0]], this.viewType);
        this.showDots = true;
        break;
      case DashboardViewType.Preparation:
        this.stats = this.initData(this.data[this.currentPreparation].unsorted.all, this.viewType);
        this.showDots = false;
        break;
    }
  }

  mounted() {
    switch(this.viewType) {
      case DashboardViewType.Day:
        this.showDots = false;
        break;
      case DashboardViewType.Week:
        let keys = getKeys(this.data['All'].byWeeks);
        this.stats = this.initData(this.data['All'].byWeeks[keys[0]], this.viewType);
        this.showDots = true;
        break;
      case DashboardViewType.Month:
        let keysM = getKeys(this.data['All'].byMonths);
        this.stats = this.initData(this.data['All'].byMonths[keysM[0]], this.viewType);
        this.showDots = true;
        break;
      case DashboardViewType.Preparation:
        this.stats = this.initData(this.data[this.currentPreparation].unsorted.all, this.viewType);
        this.showDots = false;
        break;
    }
  }

  private initData(data, viewType) {
    moment.locale('de');

    let restdays = 0;
    let totalSessions = data.stats.count;
    let totalDuration = data.stats.time;
    let totalDistance = data.stats.distance;
    let totalIntensity = 0;

    let menuHeader = '';

    switch(viewType) {
      case DashboardViewType.Day:
        break;
      case DashboardViewType.Week:
        this.days = 7;
        this.actDay = moment().isoWeekday();
        menuHeader = moment(data.rangeDate, 'de').startOf('isoWeek').format('DD.') + '-' + moment(data.rangeDate, 'de').endOf('isoWeek').format('DD. MMMM YYYY');
        restdays = moment().isoWeekday() - totalSessions - 1;
        break;
      case DashboardViewType.Month:
        this.days = moment(data.rangeDate).daysInMonth();
        this.actDay = moment().date();
        menuHeader = moment(data.rangeDate, 'de').startOf('month').format('DD.') + '-' + moment(data.rangeDate, 'de').endOf('month').format('DD. MMMM YYYY');
        restdays = moment().date() - totalSessions - 1;
        break;
      case DashboardViewType.Preparation:
        menuHeader = this.currentPreparation;
        // console.log(moment(data.rangeDate).format(), moment().format());
        let start = moment(data.rangeDate); //.format('DD.MM.YYYY');
        let end = moment(); //.format('DD.MM.YYYY');
        restdays = Math.abs(Math.round(moment.duration(start.diff(end)).asDays()))  - totalSessions - 1;
        break;
    }
    eventBus.$emit(menuEvents.set_State, menuHeader);

    let stats = [];

    stats.push(new ContentBoxModel(totalSessions, 'Einheiten', ContentBoxIcons.Run, false));

    stats.push(new ContentBoxModel(restdays, 'Ruhetage', ContentBoxIcons.Restday, false));

    let distance = formatDistance(totalDistance, FormatDistanceType.Kilometers).toFixed(2) + 'km';
    stats.push(new ContentBoxModel(distance, 'Gesamtdistanz', ContentBoxIcons.Distance, false));

    let duration = formatSecondsToDuration(totalDuration, FormatDurationType.Dynamic).all;
    stats.push(new ContentBoxModel(duration, 'Gesamtdauer', ContentBoxIcons.Duration, false));

    stats.push(new ContentBoxModel(totalIntensity, 'Gesamtintensität', ContentBoxIcons.Intensity, false));

    return stats;
  }
}
