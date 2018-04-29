/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {FilterModel} from '../../../models/Filter/FilterModel';

@Component({
  template: require('./compareListItem.html'),
})
export class CompareListItem extends Vue {
  @Prop()
  trainingCluster: string;

  @Prop()
  trainingClusterDetail: any;

  @Prop()
  filter: FilterModel;

  @Prop()
  data: Object;

  @Prop()
  loadingStatus: any;

  mounted() {
  }
}
