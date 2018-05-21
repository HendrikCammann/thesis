import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {RunType} from '../../../store/state';
import {MutationTypes} from '../../../store/mutation-types';

@Component({
  template: require('./smartFilterModule.html'),
})
export class SmartFilterModule extends Vue {
  private Runtypes = [
    {
      type: RunType.Run,
      name: 'Lauf'
    },
    {
      type: RunType.LongRun,
      name: 'Langer Lauf'
    },
    {
      type: RunType.ShortIntervals,
      name: 'Intervalle'
    },
    {
      type: RunType.Competition,
      name: 'Wettkämpfe'
    },
    {
      type: RunType.Uncategorized,
      name: 'Rest'
    }
  ];

  public handleFilterClick(type: RunType) {
    this.$store.dispatch(MutationTypes.SET_SELECTED_RUNTYPE, type);
  }
}
