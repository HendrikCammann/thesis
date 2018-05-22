import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {MutationTypes} from '../../../store/mutation-types';

@Component({
  template: require('./detailToggleModule.html'),
})
export class DetailToggleModule extends Vue {
  @Prop()
  isUnfolded: boolean;

  public handleViewClick() {
    this.$store.dispatch(MutationTypes.SET_SHOW_EVERYTHING);
  }
}
