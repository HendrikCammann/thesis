/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {RunType} from '../../../store/state';
import {ClusterWrapper} from '../../../models/State/StateModel';
import {getKeys} from '../../../utils/array-helper';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';
import {MutationTypes} from '../../../store/mutation-types';

@Component({
  template: require('./activitiesList.html'),
})
export class ActivitiesList extends Vue {
  @Prop()
  preparation: string;

  @Prop()
  loadingStatus: LoadingStatus;

  @Prop()
  selectedRunType: RunType;

  @Prop()
  showEverything: boolean;

  @Prop()
  clustering: string;

  private formatedData = null;

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

    itemsGroupedByClustering.forEach(item => {
      let week = [[], [], [], [], [], [], []];
      item.forEach(ac => {
        if (new Date(ac.date).getDay() === 0) {
          week[6].push(ac);
        } else {
          week[new Date(ac.date).getDay() - 1].push(ac);
        }
      });
      temp.push(week);
    });

    return temp;
  }

  private getColor(activity) {
    if (activity.categorization.activity_type === this.selectedRunType || this.selectedRunType == RunType.All) {
      return getCategoryColor(activity.categorization.activity_type);
    } else {
      return '#d9d9d9';
    }
  }

  private openDetailView(activity) {
    this.$store.dispatch(MutationTypes.SET_SELECTED_ACTIVITY, activity.id);
    this.$router.push({
      path: '/activity/' + activity.id
    });
  }

  private isToday(index: number, day: number) {
    if (index === 0) {
      let today = new Date();
      return today.getDay() === day;
    }
    return false;
  }

  private isFuture(index: number, day: number) {
    if (index === 0) {
      let today = new Date();
      if ((today.getDay() <= day && day === 0) || day === 0) {
        return null;
      } else {
        return 'Ruhetag'
      }
    }
    return 'Ruhetag';
  }

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      let data = this.getData(this.preparation);
      this.formatedData = this.formatData(data, this.clustering);
    }
  }
}
