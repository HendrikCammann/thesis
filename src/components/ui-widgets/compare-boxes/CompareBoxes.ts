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

@Component({
  template: require('./compareBoxes.html'),
  components: {
    'content-box': ContentBox,
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
      let type = cluster.type;
      let icon = getContentBoxIcon(type);
      let event = this.$store.getters.getActivity(cluster.eventId);
      let duration = formatSecondsToDuration(event.base_data.duration, FormatDurationType.Dynamic).all;

      competitions.push({
        box: new ContentBoxModel(duration, type, icon, false),
        id: cluster.eventId,
      });
    });

    clusters.forEach(cluster => {
      let basicItems: ContentBoxModel[] = [];

      let distance = formatDistance(cluster.data.stats.distance, FormatDistanceType.Kilometers);
      basicItems.push(new ContentBoxModel(distance.toFixed(2) + 'km', 'Gesamtumfang', ContentBoxIcons.Distance, false));

      let duration = durations[cluster.name];
      basicItems.push(new ContentBoxModel(duration + ' Wochen', 'Dauer', ContentBoxIcons.Duration, false));

      let sessions = cluster.data.stats.count;
      basicItems.push(new ContentBoxModel(sessions, 'Einheiten', ContentBoxIcons.Run, false));

      let competitions = cluster.data.stats.typeCount.competition.activities.length;
      basicItems.push(new ContentBoxModel(competitions, 'Wettkämpfe', ContentBoxIcons.Competition, false));

      basics.push(basicItems);


      let averageItems: ContentBoxModel[] = [];

      let avgDistance = distance / duration;
      averageItems.push(new ContentBoxModel(avgDistance.toFixed(2) + 'km', 'ø Wochenumfang', ContentBoxIcons.Distance, false));

      let avgSessions = sessions / duration;
      averageItems.push(new ContentBoxModel(avgSessions.toFixed(1), 'ø Wocheneinheiten', ContentBoxIcons.Run, false));

      averages.push(averageItems);
    });

    return {
      competitions: competitions,
      basics: basics,
      averages: averages,
    };
  }

  private handleEventClick(id) {
    console.log(id);
  }

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.data = this.initData(this.clusters, this.clusterData);
      console.log(this.data.basics);
    }
  }
}
