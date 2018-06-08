/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {ContentBox} from '../../ui-elements/content-box';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {ClusterItem, ClusterTypes} from '../../../models/State/StateModel';
import {ContentBoxModel, getContentBoxIcon} from '../../../models/ui-elements/content-box/ContentBoxModel';
import {eventBus} from '../../../main';
import {compareEvents} from '../../../events/Compare/compare';
import {Button} from '../../ui-elements/button';
import {MutationTypes} from '../../../store/mutation-types';
import {menuEvents} from '../../../events/Menu/menu';

@Component({
  template: require('./compareSelect.html'),
  components: {
    'content-box': ContentBox,
    'button-standard': Button
  }
})
export class CompareSelect extends Vue {
  @Prop()
  clusters: ClusterItem[];

  @Prop()
  selectedClusters: string[];

  @Prop()
  loadingStatus: LoadingStatus;

  public contentBoxData: ContentBoxModel[] = null;


  @Watch('clusters')
  @Watch('selectedClusters')
  @Watch('loaded.activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      eventBus.$emit(menuEvents.set_State, this.selectedClusters.length + '/2 ausgewählt');
      this.contentBoxData = this.initData(this.clusters, this.selectedClusters);
    }
  }

  private initData(clusters: ClusterItem[], selectedClusters: string[]): ContentBoxModel[] {
    let formattedClusters: ContentBoxModel[] = [];
    clusters.forEach(cluster => {
      if (cluster.clusterName !== 'All') {
        let name = cluster.clusterName;
        let type = cluster.type;
        let icon = getContentBoxIcon(cluster.type);
        let selected = selectedClusters.indexOf(name) > -1;

        let item = new ContentBoxModel(name, type, icon, selected);

        formattedClusters.push(item);
      }
    });

    return formattedClusters;
  }

  public startCompare() {
    eventBus.$emit(menuEvents.set_State, this.selectedClusters[0] + ' | ' + this.selectedClusters[1]);
    eventBus.$emit(compareEvents.start_Compare);
  }

  public showCta() {
    return this.selectedClusters.length === 2;
  }

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.contentBoxData = this.initData(this.clusters, this.selectedClusters);
    }

    eventBus.$emit(menuEvents.set_State, this.selectedClusters.length + '/2 ausgewählt');

    eventBus.$on(compareEvents.add_Training_Cluster, (type) => {
      this.$store.dispatch(MutationTypes.ADD_SELECTED_TRAINING_CLUSTER, type);
    });
  }
}
