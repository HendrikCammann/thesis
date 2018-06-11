/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as moment from 'moment';
import {FeedItem} from '../../ui-elements/feed-item';

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

  private list: any[] = null;

  @Watch('listItems')
  @Watch('listItems.All')
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
      data['All'].unsorted.all.activities.forEach((item, i) => {
        if (i < 10) {
          list.push(this.$store.getters.getActivity(item));
        }
      });
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
