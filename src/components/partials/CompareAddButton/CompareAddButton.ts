/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {compareBus, modalBus} from '../../../main';
import {compareEvents} from '../../../events/Compare/compare';
import {modalEvents} from '../../../events/Modal/modal';

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
    modalBus.$emit(modalEvents.open_Modal);
  }

  mounted() {
  }
}