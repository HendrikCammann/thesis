/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {FilterModel} from '../../../models/Filter/FilterModel';
import {CompareBox} from '../CompareBox';

@Component({
  template: require('./compareListItem.html'),
  components: {
    'compareBox': CompareBox,
  }
})
export class CompareListItem extends Vue {
  @Prop()
  trainingCluster: string;

  @Prop()
  trainingClusterDetail: any;

  @Prop()
  data: Object;

  @Prop()
  loadingStatus: any;

  mounted() {
  }
}
