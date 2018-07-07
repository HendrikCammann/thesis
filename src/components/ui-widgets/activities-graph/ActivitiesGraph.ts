/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {Toggle} from '../../ui-elements/toggle';
import {eventBus} from '../../../main';
import {TrainChart} from '../../visualizations/train-chart';
import {mapGetters} from 'vuex';
import {ToggleEvents} from '../../../events/toggle/Toggle';
import {ActivitiesList} from '../activities-list';
import {Modal} from '../modal';
import {modalEvents} from '../../../events/Modal/modal';
import {ModalList} from '../../ui-elements/modal-list';

@Component({
  template: require('./activitiesGraph.html'),
  computed: mapGetters({
    sortedLists: 'getSortedLists',
    loadingStatus: 'getAppLoadingStatus',
    selectedRunType: 'getSelectedRunType',
    selectedDisplayType: 'getSelectedDisplayType',
    showEverything: 'getShowEverything',
  }),
  components: {
    'toggle-standard': Toggle,
    'activities-list': ActivitiesList,
    'train-chart': TrainChart,
    'modal': Modal,
    'modal-list': ModalList,
  }
})
export class ActivitiesGraph extends Vue {
  @Prop()
  cluster: any;

  public showModal = false;
  public modalItem = null;
  public modalRange = null;
  public toggleData: string[] = ['Entwicklung', 'Liste'];
  public selectedToggle: number = 0;

  public scrolling;
  public fadeToggle = false;

  public handleScroll() {
    window.clearTimeout( this.scrolling );
    this.fadeToggle = true;
    let that = this;
    // Set a timeout to run after scrolling ends
    this.scrolling = setTimeout(function() {

      // Run the callback
      console.log( 'Scrolling has stopped.' );
      that.fadeToggle = false;

    }, 66);
  }

  mounted() {
    window.addEventListener('scroll', this.handleScroll);

    eventBus.$on(ToggleEvents.set_Selection, (index) => {
      this.selectedToggle = index;
    });

    eventBus.$on(modalEvents.open_Modal, (item) => {
      if (typeof item[0] === 'number') {
        let temp = [];
        item.forEach(id => {
          temp.push(this.$store.getters.getActivity(id));
        });
        this.modalItem = temp;
        this.modalRange = 'long';
      } else {
        this.modalItem = item;
        this.modalRange = 'short';
      }
      this.showModal = true;
    });

    eventBus.$on(modalEvents.close_Modal, () => {
      this.showModal = false;
      this.modalItem = null;
    });
  }

  destroyed() {
    window.removeEventListener('scroll', this.handleScroll);
  }
}
