import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {mapGetters} from 'vuex';
import {loadingStatus} from '../../../models/App/AppStatus';
import {ActivitiesGraph} from '../../ui-widgets/activities-graph';
import {DisplayType, RunType} from '../../../store/state';
import {FloatingMenu} from '../../ui-widgets/floating-menu';
import {eventBus} from '../../../main';
import {FloatingMenuEvents} from '../../../events/floating-menu/FloatingMenu';
import {BottomMenu} from '../../ui-widgets/bottom-menu';
import {BottomMenuEvents} from '../../../events/bottom-menu/bottomMenu';
import {menuEvents} from '../../../events/Menu/menu';

@Component({
  template: require('./activities.html'),
  computed: mapGetters({
    sortedLists: 'getSortedLists',
    loadingStatus: 'getAppLoadingStatus',
    showEverything: 'getShowEverything',
    selectedDisplayType: 'getSelectedDisplayType',
    selectedRunTyp: 'getSelectedRunType',
  }),
  components: {
    'activities-graph': ActivitiesGraph,
    'bottomMenu': BottomMenu,
    'floating-menu': FloatingMenu,
  }
})
export class ActivitiesContainer extends Vue {
  public selectedMenu = null;

  public menuItems = [
    {
      name: 'Darstellung',
      icon: 'type--dark',
      action: 'chartToggle',
      index: 0,
      selected: this.$store.getters.getShowEverything,
      items: [{
        name: 'Detail',
        icon: 'detail--dark',
        action: false,
      }, {
        name: 'Gesamt',
        icon: 'total--dark',
        action: true,
      }]
    },
    {
      name: 'Stellschraube',
      icon: 'screw--dark',
      action: 'screwToggle',
      selected: this.$store.getters.getSelectedDisplayType,
      index: 1,
      items: [{
        name: 'Distanz',
        icon: 'distance--dark',
        action: DisplayType.Distance,
      }, {
        name: 'Dauer',
        icon: 'time--dark',
        action: DisplayType.Duration,
      }, {
        name: 'Intensität',
        icon: 'intensity--dark',
        action: DisplayType.Intensity,
      }]
    },
    {
      name: 'Filter',
      icon: 'filter--dark',
      action: 'toggleRunType',
      index: 2,
      selected: this.$store.getters.getSelectedRunType,
      items: [{
        name: 'Alle',
        icon: 'run--dark',
        action: RunType.All
      }, {
        name: 'Langer Dauerlauf',
        icon: 'run--ldl',
        action: RunType.LongRun

      }, {
        name: 'Dauerlauf',
        icon: 'run--dl',
        action: RunType.Run
      }, {
        name: 'Tempo Dauerlauf',
        icon: 'run--tdl',
        action: RunType.Uncategorized
      }, {
        name: 'Intervalle',
        icon: 'run--iv',
        action: RunType.ShortIntervals
      }, {
        name: 'Wettkämpfe',
        icon: 'run--comp',
        action: RunType.Competition
      }]
    },
  ];

  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }

    eventBus.$emit(menuEvents.set_State, this.$store.getters.getSelectedRunType);

    eventBus.$on(BottomMenuEvents.set_Selected_Menu, (i) => {
      this.selectedMenu = i;
    });

    eventBus.$on(BottomMenuEvents.dispatch_Overlay_Click, (payload) => {
      switch (payload.menu) {
        case 0:
          this.$store.dispatch(MutationTypes.SET_SHOW_EVERYTHING, payload.payload);
          break;
        case 1:
          this.$store.dispatch(MutationTypes.SET_SELECTED_DISPLAYTYPE, payload.payload);
          break;
        case 2:
          this.$store.dispatch(MutationTypes.SET_SELECTED_RUNTYPE, payload.payload);
          eventBus.$emit(menuEvents.set_State, payload.payload);
          break;
      }
    });
  }
}
