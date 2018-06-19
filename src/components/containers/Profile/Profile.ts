import Vue from 'vue';
import Component from 'vue-class-component';
import {eventBus} from '../../../main';
import {menuEvents} from '../../../events/Menu/menu';
import {ContentBox} from '../../ui-elements/content-box';
import {ContentBoxIcons, ContentBoxModel} from '../../../models/ui-elements/content-box/ContentBoxModel';
import {MutationTypes} from '../../../store/mutation-types';
import {loadingStatus} from '../../../models/App/AppStatus';
import {Button} from '../../ui-elements/button';


@Component({
  template: require('./profile.html'),
  components : {
    'content-box': ContentBox,
    'button-standard': Button
  }
})
export class Profile extends Vue {

  public weight: ContentBoxModel = null;
  public Vo2max: ContentBoxModel;
  public maxHF: ContentBoxModel;
  public restHF: ContentBoxModel;

  public totalActivities: ContentBoxModel;
  public totalCompetitions: ContentBoxModel;

  public HalfMarathon = {
    type: 'Halbmarathon',
    time: '1h 24min 05s',
    activityId: 1187823373,
  };

  public Marathon = {
    type: 'Marathon',
    time: '3h 07min 35s',
    activityId: 1496287411,
  };

  public Tenk = {
    type: '10km',
    time: '39min 03s',
    activityId: 1231655637,
  };


  private createBoxes() {
    this.weight = new ContentBoxModel('79kg', 'Gewicht', ContentBoxIcons.Restday, false, null);
    this.Vo2max = new ContentBoxModel('59 ml/kg', 'VO2 max.', ContentBoxIcons.Restday, false, null);
    this.maxHF = new ContentBoxModel('199', 'max. HF', ContentBoxIcons.Heartrate, false, null);
    this.restHF = new ContentBoxModel('44', 'Ruhepuls', ContentBoxIcons.Heartrate, false, null);

    this.totalActivities = new ContentBoxModel(this.$store.getters.getNumberOfActivities, 'Einheiten', ContentBoxIcons.Run, false, null);
    this.totalCompetitions = new ContentBoxModel(this.$store.getters.getNumberOfCompetitions, 'Wettkämpfe', ContentBoxIcons.Run, false, null);
  }

  private handleClick(id) {
    this.$store.dispatch(MutationTypes.SET_SELECTED_ACTIVITY, id);
    this.$router.push({
      path: '/activity/' + id
    });
  }

  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      this.$store.dispatch(MutationTypes.SET_LOADING_STATUS, loadingStatus.Loading);
      this.$store.dispatch(MutationTypes.GET_ACTIVITIES);
    }
    this.createBoxes();
    eventBus.$emit(menuEvents.set_State, 'Hendrik Cammann');
  }
}
