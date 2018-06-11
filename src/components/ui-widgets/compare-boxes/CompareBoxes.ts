import {Component, Prop, Watch} from 'vue-property-decorator';
import Vue from 'vue';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {ClusterItem, ClusterWrapper} from '../../../models/State/StateModel';
import {
  ContentBoxIcons,
  ContentBoxModel,
  getContentBoxIcon
} from '../../../models/ui-elements/content-box/ContentBoxModel';
import {formatDistance} from '../../../utils/format-data';
import {FormatDistanceType, FormatDurationType} from '../../../models/FormatModel';
import {formatSecondsToDuration} from '../../../utils/time/time-formatter';
import {ContentBox} from '../../ui-elements/content-box';
import {MutationTypes} from '../../../store/mutation-types';
import {getLargerValue, getSmallerValue} from '../../../utils/numbers/numbers';
import {Divider} from '../../ui-elements/divider';
import * as moment from 'moment';

@Component({
  template: require('./compareBoxes.html'),
  components: {
    'content-box': ContentBox,
    'divider': Divider,
  }
})
export class CompareBoxes extends Vue {
  @Prop()
  clusters: any[];

  @Prop()
  clusterData: ClusterItem[];

  @Prop()
  loadingStatus: LoadingStatus;

  public data = null;

  @Watch('clusters')
  @Watch('selectedClusters')
  @Watch('loaded.activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.data = this.initData(this.clusters, this.clusterData);
    }
  }

  private initData(clusters: any[], clusterData: any): any {
    let competitions = [];
    let basics = [];
    let averages = [];

    let durations = [];

    clusterData.forEach(cluster => {
      durations[cluster.clusterName] = cluster.duration.range;
      if (moment(cluster.timeRange.end).isAfter(moment())) {
        durations[cluster.clusterName] = Math.round(moment.duration(moment().diff(moment(cluster.timeRange.start))).asWeeks());
      }
      let type = cluster.type;
      let icon = getContentBoxIcon(type);
      let event = this.$store.getters.getActivity(cluster.eventId);
      let duration = formatSecondsToDuration(event.base_data.duration, FormatDurationType.Dynamic).all;

      competitions.push({
        box: new ContentBoxModel(duration, type, icon, false),
        id: cluster.eventId,
      });
    });

    let maxSessionAvg = 0;
    let maxKm = 0;
    let maxIntensityAvg = 0;

    clusters.forEach(cluster => {
      maxSessionAvg = getLargerValue((cluster.data.stats.count / durations[cluster.name]), maxSessionAvg);
      maxKm = getLargerValue((formatDistance(cluster.data.stats.distance, FormatDistanceType.Kilometers) / durations[cluster.name]), maxKm);
      maxIntensityAvg = getLargerValue((cluster.data.stats.intensity / durations[cluster.name]), maxIntensityAvg);
    });

    clusters.forEach(cluster => {
      let basicItems: ContentBoxModel[] = [];

      let distance = formatDistance(cluster.data.stats.distance, FormatDistanceType.Kilometers);
      basicItems.push(new ContentBoxModel(distance.toFixed(2) + 'km', 'Gesamtumfang', ContentBoxIcons.Distance, false));

      let duration = durations[cluster.name];
      console.log(cluster);
      basicItems.push(new ContentBoxModel(duration + ' Wochen', 'Dauer', ContentBoxIcons.Duration, false));

      let sessions = cluster.data.stats.count;
      basicItems.push(new ContentBoxModel(sessions, 'Einheiten', ContentBoxIcons.Run, false));

      let competitions = cluster.data.stats.typeCount.competition.activities.length;
      basicItems.push(new ContentBoxModel(competitions, 'Wettkämpfe', ContentBoxIcons.Competition, false));

      basics.push(basicItems);


      let averageItems: ContentBoxModel[] = [];


      let avgDistance = distance / duration;
      let disAc = avgDistance === maxKm;
      averageItems.push(new ContentBoxModel(avgDistance.toFixed(2) + 'km', 'ø Wochenumfang', ContentBoxIcons.Distance, disAc));

      let avgSessions = sessions / duration;
      let secAc = avgSessions === maxSessionAvg;
      averageItems.push(new ContentBoxModel(avgSessions.toFixed(1), 'ø Wocheneinheiten', ContentBoxIcons.Run, secAc));

      let avgIntensity = cluster.data.stats.intensity / duration;
      let intAc = avgIntensity === maxIntensityAvg;
      averageItems.push(new ContentBoxModel(Math.round(avgIntensity), 'ø Wochenintensität', ContentBoxIcons.Intensity, intAc));

      averages.push(averageItems);
    });

    return {
      competitions: competitions,
      basics: basics,
      averages: averages,
    };
  }

  private handleEventClick(id) {
    this.$store.dispatch(MutationTypes.SET_SELECTED_ACTIVITY, id);
    this.$router.push({
      path: '/activity/' + id
    });
  }

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.data = this.initData(this.clusters, this.clusterData);
    }
  }
}
