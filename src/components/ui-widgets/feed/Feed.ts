/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as moment from 'moment';
import {FeedItem} from '../../ui-elements/feed-item';
import {RunType} from '../../../store/state';
import {TimeRangeModel, TimeRangeType} from '../../../models/Filter/FilterModel';
import {checkIfDateIsInRange} from '../../../utils/time/time-formatter';

@Component({
  template: require('./feed.html'),
  components: {
    'feedItem': FeedItem,
  }
})
export class Feed extends Vue {
  @Prop()
  listItems: any[];

  @Prop()
  isDashboard: boolean;

  @Prop()
  selectedRunType: RunType;

  @Prop()
  timeRange: TimeRangeModel;

  public list: any[] = null;

  @Watch('listItems')
  @Watch('listItems.All')
  @Watch('selectedRunType')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.isDashboard && this.listItems !== undefined) {
      this.list = this.initDashboardFeed(this.listItems);
    } else if (this.listItems !== undefined) {
      this.list = this.initFeed(this.listItems[0]);
    }
  }

  mounted() {
    if (this.isDashboard && this.listItems !== undefined) {
      this.list = this.initDashboardFeed(this.listItems);
    } else if (this.listItems !== undefined) {
      this.list = this.initFeed(this.listItems[0]);
    }
  }

  private initFeed(data): any[] {
    let list = [];
    if (data['All'].unsorted.all !== undefined) {
      if (this.selectedRunType === RunType.All) {
        data['All'].unsorted.all.activities.forEach((item, i) => {
          if (list.length < 20) {
            list.push(this.$store.getters.getActivity(item));
          }
        });
      } else {
        let filtered = data['All'].unsorted.all.activities.filter(item => this.$store.getters.getActivity(item).categorization.activity_type === this.selectedRunType);
        filtered.forEach(item => {
          if (list.length < 20) {
            list.push(this.$store.getters.getActivity(item));
          }
        })
      }
    }

    if (this.timeRange.rangeType !== TimeRangeType.None) {
      list = list.filter(item => checkIfDateIsInRange(this.timeRange, item.date) === true);
    }
    return list;
  }

  private initDashboardFeed(data): any[] {
    moment.locale('de');
    let actDay = moment().isoWeekday();

    let list = [];
    data[/* actDay - */ 1].forEach(item => {
      list.push(item);
    });

    return list;
  }
}
