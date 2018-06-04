/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';
import {RunType} from '../../../store/state';
import {MutationTypes} from '../../../store/mutation-types';

@Component({
  template: require('./modalList.html'),
})
export class ModalList extends Vue {
  @Prop()
  items: any[];

  private getColor(activity) {
    return getCategoryColor(activity.categorization.activity_type);
  }

  public openDetail(id: number) {
    event.preventDefault();
    event.stopPropagation();
    this.$store.dispatch(MutationTypes.SET_SELECTED_ACTIVITY, id);
    this.$router.push({
      path: '/activity/' + id
    });
  }
}
