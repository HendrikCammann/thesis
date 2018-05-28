/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {eventBus} from '../../../main';
import {compareEvents} from '../../../events/Compare/compare';
import {modalEvents} from '../../../events/Modal/modal';

@Component({
  template: require('./compareAddButton.html'),
})
export class CompareAddButton extends Vue {
  @Prop()
  trainingCluster: string;

  @Prop()
  isAdd: boolean;

  @Prop()
  trainingClusters: string[];

  @Prop()
  existingClusters: any[];

  private selectedValue = '';

  public removeTrainingCluster () {
    eventBus.$emit(compareEvents.remove_Training_Cluster, this.trainingCluster);
  }

  public addTrainingCluster () {
    eventBus.$emit(compareEvents.add_Training_Cluster, this.selectedValue);
  }

  get chooseableClusters() {
    return this.existingClusters.filter(item => {
      if (this.trainingClusters.indexOf(item.clusterName) < 0 && item.clusterName !== 'All') {
        return item;
      }
    })
  }

  mounted() {
  }
}
