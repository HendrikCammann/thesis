/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {compareBus} from '../../../main';
import {compareEvents} from '../../../events/Compare/compare';

@Component({
  template: require('./compareAddButton.html'),
})
export class CompareAddButton extends Vue {
  @Prop()
  trainingCluster: string;

  @Prop()
  isAdd: true;

  public removeTrainingCluster () {
    compareBus.$emit(compareEvents.remove_Training_Cluster, this.trainingCluster);
  }

  public addTrainingCluster () {
    // compareBus.$emit(compareEvents.add_Training_Cluster, this.trainingCluster);
    console.log('add');
  }

  mounted() {
  }
}
