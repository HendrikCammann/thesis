/* tslint:disable */
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';
import {MutationTypes} from '../../../store/mutation-types';
import {TitleBox} from '../../partials/TitleBox';
import {ClusterItem} from '../../../models/State/StateModel';
import {compareEvents} from '../../../events/Compare/compare';
import {compareBus} from '../../../main';

@Component({
  template: require('./compareAddModule.html'),
  components: {
    titleBox: TitleBox
  }
})
export class CompareAddModule extends Vue {
  @Prop()
  existingClusters: ClusterItem[];

  @Prop()
  selectedClusters: string[];

  public removeCluster(cluster) {
    event.stopPropagation();
    compareBus.$emit(compareEvents.remove_Training_Cluster, cluster);
  }

  public addCluster(cluster) {
    event.stopPropagation();
    compareBus.$emit(compareEvents.add_Training_Cluster, cluster);
  }

  public get unselectedClusters() {
    let temp = [];
    this.existingClusters.map(item => {
      if (this.selectedClusters.indexOf(item.clusterName) < 0 && item.isIndividual === true) {
        temp.push(item);
      }
    });
    return temp;
  }
}
