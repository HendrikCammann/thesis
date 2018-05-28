/* tslint:disable */
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';
import {CompareAddButton} from '../../partials/CompareAddButton';

@Component({
  template: require('./compareAddModule.html'),
  components: {
    'compareAddButton': CompareAddButton,
  }
})
export class CompareAddModule extends Vue {
  @Prop()
  selectedClusters: string[];

  @Prop()
  existingClusters: any[];
}
