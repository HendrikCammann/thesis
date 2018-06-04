import Vue from 'vue';
import Component from 'vue-class-component';
import {MutationTypes} from '../../../store/mutation-types';
import {mapGetters} from 'vuex';
import {loadingStatus} from '../../../models/App/AppStatus';
import {ActivitiesGraph} from '../../ui-widgets/activities-graph';
import {RunType} from '../../../store/state';
import {FloatingMenu} from '../../ui-widgets/floating-menu';
import {eventBus} from '../../../main';
import {FloatingMenuEvents} from '../../../events/floating-menu/FloatingMenu';

@Component({
  template: require('./activities.html'),
  computed: mapGetters({
    sortedLists: 'getSortedLists',
    loadingStatus: 'getAppLoadingStatus',
    selectedRunType: 'getSelectedRunType',
    selectedDisplayType: 'getSelectedDisplayType',
    showEverything: 'getShowEverything',
    selectedWeeksLength: 'getSelectedWeeksLength',
  }),
  components: {
    'activities-graph': ActivitiesGraph,
    'floating-menu': FloatingMenu,
  }
})
export class ActivitiesContainer extends Vue {
  public selectedMenu = {
    top: this.$store.getters.getSelectedRunType,
    bottom: this.$store.getters.getShowEverything,
  };

  public menuItems = {
    top: [
      {
        name: 'Alle',
        icon: 'running--darkgray',
        action: RunType.All
      },
      {
        name: 'Dauerlauf',
        icon: 'running--dl',
        action: RunType.Run
      },
      {
        name: 'Langer Dauerlauf',
        icon: 'running--ldl',
        action: RunType.LongRun
      },
      {
        name: 'Intervalle',
        icon: 'running--interval',
        action: RunType.ShortIntervals
      },
      {
        name: 'Wettkämpfe',
        icon: 'running--comp',
        action: RunType.Competition
      },
      {
        name: 'Unkategorisiert',
        icon: 'running--gray',
        action: RunType.Uncategorized
      },
    ],
    bottom: [
      {
        name: 'Entwicklung',
        icon: 'running--gray',
        action: false,
      },
      {
        name: 'Detail',
        icon: 'running--gray',
        action: true,
      },
    ]
  };

  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }

    eventBus.$on(FloatingMenuEvents.set_Filter, (item) => {
      if (item.isTop) {
        this.$store.dispatch(MutationTypes.SET_SELECTED_RUNTYPE, item.action);
        this.selectedMenu.top = this.$store.getters.getSelectedRunType;
      } else {
        this.$store.dispatch(MutationTypes.SET_SHOW_EVERYTHING, item.action);
        this.selectedMenu.bottom = this.$store.getters.getShowEverything;
      }
    });
  }
}
