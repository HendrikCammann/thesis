import Vue from 'vue';
import Component from 'vue-class-component';
import {loadingStatus} from '../../../models/App/AppStatus';
import {MutationTypes} from '../../../store/mutation-types';
import {mapGetters} from 'vuex';
import {eventBus} from '../../../main';
import {compareEvents} from '../../../events/Compare/compare';
import {CompareSelect} from '../../ui-widgets/compare-select';
import {CompareBoxes} from '../../ui-widgets/compare-boxes';
import {CompareGraph} from '../../ui-widgets/compare-graph';
import {FloatingMenu} from '../../ui-widgets/floating-menu';
import {DisplayType, RunType} from '../../../store/state';
import {FloatingMenuEvents} from '../../../events/floating-menu/FloatingMenu';
import {Divider} from '../../ui-elements/divider';


@Component({
  template: require('./compare.html'),
  computed: mapGetters({
    selectedTrainingClustersData: 'getSelectedTrainingClustersData',
    selectedTrainingClustersFull: 'getSelectedTrainingClustersFull',
    selectedTrainingClusters: 'getSelectedTrainingClusters',
    existingClusters: 'getExistingClusters',
    loadingStatus: 'getAppLoadingStatus',
    sortedLists: 'getSortedLists',
    showAbsolute: 'getShowAbsolute',
  }),
  components: {
    'compare-select': CompareSelect,
    'compare-boxes': CompareBoxes,
    'compare-graph': CompareGraph,
    'floating-menu': FloatingMenu,
  }
})
export class CompareContainer extends Vue {
  public isSelection = true;

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

    eventBus.$on(compareEvents.start_Compare, () => {
      this.$router.push({ path: `/compare?step=${'compare'}` });
    });

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

  updated() {
    if (this.$route.query.step && this.$route.query.step === 'compare') {
      if (this.$store.getters.getSelectedTrainingClusters.length === 2) {
        this.isSelection = false;
      } else {
        this.$router.push({ path: `/compare` });
        this.isSelection = true;
      }
    }
  }
}
