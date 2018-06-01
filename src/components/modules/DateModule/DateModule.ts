import Vue from 'vue';
import * as moment from 'moment';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {RunType} from '../../../store/state';
import {getKeys} from '../../../utils/array-helper';
import {ClusterWrapper} from '../../../models/State/StateModel';

@Component({
  template: require('./dateModule.html'),
})
export class DateModule extends Vue {
  @Prop()
  preparation: string;

  @Prop()
  loadingStatus: LoadingStatus;

  @Prop()
  selectedRunType: RunType;

  @Prop()
  clustering: string;

  private formatedData = null;
  private _year = null;

  @Watch('loadingStatus.activities')
  @Watch('selectedRunType')
  @Watch('showEverything')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      let data = this.getData(this.preparation);
      this.formatedData = this.formatData(data, this.clustering);
    }
  }

  /**
   * get the Cluster from store
   * @param {string} preparation
   * @returns {ClusterWrapper}
   */
  private getData(preparation: string): ClusterWrapper {
    return this.$store.state.sortedLists[preparation];
  }

  private isNewYear(year: string | number) {
    if (this._year === null) {
      this._year = year;
      return year;
    } else {
      if (year !== this._year) {
        this._year = year;
        return year;
      } else {
        this._year = year;
        return null;
      }
    }
  }

  private formatData(data: ClusterWrapper, clustering: string) {
    let keys = getKeys(data[clustering]);

    let itemsGroupedByClustering = [];
    keys.forEach(key => {
      let week = [];
      data[clustering][key].activities.forEach(id => {
        let activity = this.$store.getters.getActivity(id);
        week.push(activity);
      });
      week = week.sort( (a: any, b: any) => {
        return +new Date(b.date) - +new Date(a.date);
      });
      itemsGroupedByClustering.push(week);
    });

    let temp = [];

    let type: any = 'isoWeek';

    let date = moment(itemsGroupedByClustering[0][0].date);

    let durationObject = {
      start: date.startOf(type).toDate(),
      end: date.endOf(type).toDate()
    };


    for (let i = 0; i < itemsGroupedByClustering.length; i++) {
      if (i > 0) {
        let subtract1 = moment(durationObject.start).subtract(i, 'week').toDate();
        let subtract2 = moment(durationObject.end).subtract(i, 'week').toDate();

        let obj = {
          start: moment(subtract1).format('DD.MM'),
          end: moment(subtract2).format('DD.MM'),
          year: moment(subtract1).format('YYYY'),
        };

        temp.push(obj);
      } else {
        let d1 = moment(durationObject.start);
        let d2 = moment(durationObject.end);

        let obj = {
          start: moment(d1).format('DD.MM'),
          end: moment(d2).format('DD.MM'),
          year: moment(d1).format('YYYY'),
        };
        temp.push(obj);
      }
    }

    // console.log(temp);
    // console.log('-----');
    // console.log(temp);

    return temp;
  }

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      let data = this.getData(this.preparation);
      this.formatedData = this.formatData(data, this.clustering);
    }
  }
}
