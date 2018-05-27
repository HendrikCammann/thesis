import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {DisplayType, RunType} from '../../../store/state';
import {MutationTypes} from '../../../store/mutation-types';
import {mapGetters} from 'vuex';

@Component({
  template: require('./displayTypeToggleModule.html'),
  computed: mapGetters({
    selectedDisplayType: 'getSelectedDisplayType',
  }),
})
export class DisplayTypeToggleModule extends Vue {
  private active = 'pie-chart';
  private DisplayTypes = [
    {
      type: DisplayType.Distance,
      name: 'Distance',
      img: 'pie-chart',
    },
    {
      type: DisplayType.Duration,
      name: 'Dauer',
      img: 'timer',
    },
    {
      type: DisplayType.Intensity,
      name: 'Intensität',
      img: 'lightning',
    },
  ];

  private isShown: boolean = false;

  public handleFilterClick(type: DisplayType, img: string) {
    this.active = img;
    this.$store.dispatch(MutationTypes.SET_SELECTED_DISPLAYTYPE, type);
  }

  public toggleFilter() {
    this.isShown = !this.isShown;
  }
}
