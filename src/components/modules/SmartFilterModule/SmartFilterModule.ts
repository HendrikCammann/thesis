import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {RunType} from '../../../store/state';
import {MutationTypes} from '../../../store/mutation-types';
import {CategoryColors} from '../../../models/VisualVariableModel';

@Component({
  template: require('./smartFilterModule.html'),
})
export class SmartFilterModule extends Vue {
  private Runtypes = [
    {
      type: RunType.All,
      name: 'Alle',
      color: CategoryColors.Default
    },
    {
      type: RunType.Run,
      name: 'Lauf',
      color: CategoryColors.Run
    },
    {
      type: RunType.LongRun,
      name: 'Langer Lauf',
      color: CategoryColors.LongRun
    },
    {
      type: RunType.ShortIntervals,
      name: 'Intervalle',
      color: CategoryColors.ShortIntervals
    },
    {
      type: RunType.Competition,
      name: 'Wettkämpfe',
      color: CategoryColors.Competition
    },
    {
      type: RunType.Uncategorized,
      name: 'Rest',
      color: CategoryColors.Uncategorized
    }
  ];

  private isShown: boolean = false;

  public handleFilterClick(type: RunType) {
    this.$store.dispatch(MutationTypes.SET_SELECTED_RUNTYPE, type);
  }

  public handleViewClick() {
    this.$store.dispatch(MutationTypes.SET_SHOW_EVERYTHING);
  }

  public toggleFilter() {
    this.isShown = !this.isShown;
  }
}
