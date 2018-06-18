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
import {DashboardViewType, DisplayType, RunType} from '../../../store/state';
import {CompareCompare} from '../../ui-widgets/compare-compare';
import {BottomMenu} from '../../ui-widgets/bottom-menu';
import {BottomMenuEvents} from '../../../events/bottom-menu/bottomMenu';
import {ModalBox} from '../../ui-elements/modal-box';
import {Modal} from '../../ui-widgets/modal';
import {modalEvents} from '../../../events/Modal/modal';
import {ModalList} from '../../ui-elements/modal-list';


@Component({
  template: require('./compare.html'),
  computed: mapGetters({
    selectedTrainingClustersData: 'getSelectedTrainingClustersData',
    selectedTrainingClustersFull: 'getSelectedTrainingClustersFull',
    selectedTrainingClusters: 'getSelectedTrainingClusters',
    showEverything: 'getShowEverything',
    selectedDisplayType: 'getSelectedDisplayType',
    selectedRunTyp: 'getSelectedRunType',
    existingClusters: 'getExistingClusters',
    loadingStatus: 'getAppLoadingStatus',
    sortedLists: 'getSortedLists',
    showAbsolute: 'getShowAbsolute',
  }),
  components: {
    'compare-select': CompareSelect,
    'compare-boxes': CompareBoxes,
    'compare-graph': CompareGraph,
    'compare-compare': CompareCompare,
    'bottomMenu': BottomMenu,
    'modal': Modal,
    'modal-box': ModalBox,
    'modal-list': ModalList,
  }
})
export class CompareContainer extends Vue {
  public isSelection = true;
  public selectedMenu = null;
  public showModal = false;
  public modalItem = null;
  public modalRange = null;
  public useModalBox = true;

  public menuItems = [
    {
      name: 'Darstellung',
      icon: 'running--gray',
      action: 'chartToggle',
      index: 0,
      selected: this.$store.getters.getShowEverything,
      items: [{
          name: 'Detail',
          icon: 'running--gray',
          action: false,
        }, {
          name: 'Gesamt',
          icon: 'running--gray',
          action: true,
        }]
    },
    {
      name: 'Stellschraube',
      icon: 'running--gray',
      action: 'screwToggle',
      selected: this.$store.getters.getSelectedDisplayType,
      index: 1,
      items: [{
          name: 'Distanz',
          icon: 'distance--gray',
          action: DisplayType.Distance,
        }, {
          name: 'Dauer',
          icon: 'clock--gray',
          action: DisplayType.Duration,
        }, {
          name: 'Intensität',
          icon: 'flash--gray',
          action: DisplayType.Intensity,
        }]
    },
    {
      name: 'Filter',
      icon: 'filter--gray',
      action: 'toggleRunType',
      index: 2,
      selected: this.$store.getters.getSelectedRunType,
      items: [{
          name: 'Alle',
          icon: 'running--darkgray',
          action: RunType.All
        }, {
          name: 'Dauerlauf',
          icon: 'running--dl',
          action: RunType.Run
        }, {
          name: 'Langer Dauerlauf',
          icon: 'running--ldl',
          action: RunType.LongRun
        }, {
          name: 'Intervalle',
          icon: 'running--interval',
          action: RunType.ShortIntervals
        }, {
          name: 'Wettkämpfe',
          icon: 'running--comp',
          action: RunType.Competition
        }, {
          name: 'Unkategorisiert',
          icon: 'running--gray',
          action: RunType.Uncategorized
        }]
    },
  ];

  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }

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
          break;
      }
    });

    eventBus.$on(modalEvents.open_Modal, (payload) => {
      if (typeof payload[0] === 'number') {
        let temp = [];
        payload.forEach(id => {
          temp.push(this.$store.getters.getActivity(id));
        });
        this.modalItem = temp;
        this.modalRange = 'long';
        this.useModalBox = false;
      } else {
        this.modalItem = payload;
        this.useModalBox = true;
      }
      this.showModal = true;
    });

    eventBus.$on(modalEvents.close_Modal, () => {
      this.showModal = false;
      this.modalItem = null;
    });


    eventBus.$on(compareEvents.start_Compare, () => {
      this.$router.push({ path: `/compare?step=${'compare'}` });
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
