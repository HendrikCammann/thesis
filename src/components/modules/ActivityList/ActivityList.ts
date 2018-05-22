/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {MutationTypes} from '../../../store/mutation-types';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {RunType} from '../../../store/state';
import {ClusterWrapper} from '../../../models/State/StateModel';
import {getKeys} from '../../../utils/array-helper';

@Component({
  template: require('./ActivityList.html'),
})
export class ActivityList extends Vue {
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
      console.log(this.formatedData);
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
    // keys = keys.reverse();

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

    return itemsGroupedByClustering;
  }

  mounted() {

  }
}
