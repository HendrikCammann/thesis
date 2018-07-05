/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {ActivityModel} from '../../../models/Activity/ActivityModel';
import {formatDistance, formatPace} from '../../../utils/format-data';
import {FormatDistanceType, FormatDurationType, FormatPaceType} from '../../../models/FormatModel';
import {ContentBoxIcons} from '../../../models/ui-elements/content-box/ContentBoxModel';
import {formatSecondsToDuration} from '../../../utils/time/time-formatter';
import {decodePolyline} from '../../../utils/map/map';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';
import {LMap, LTileLayer, LPolyline} from 'vue2-leaflet';
import L from 'leaflet'
import * as moment from 'moment';
import {MutationTypes} from '../../../store/mutation-types';
import {loadingStatus} from '../../../models/App/AppStatus';

@Component({
  template: require('./feedItem.html'),
  components: {
    'leafletMap': LMap,
    'leafletTilelayer': LTileLayer,
    'leafletPolyline': LPolyline,
  }
})
export class FeedItem extends Vue {
  @Prop()
  activity: ActivityModel | any;

  @Prop()
  isDashboard: boolean;

  private data = null;

  @Watch('activity')
  onPropertyChanged(val: any, oldVal: any) {
    this.data = this.setupData(this.activity);
  }

  mounted() {
    this.data = this.setupData(this.activity);
  }

  private openDetailView() {
    this.$store.dispatch(MutationTypes.SET_SELECTED_ACTIVITY, this.activity.id);
    this.$router.push({
      path: '/activity/' + this.activity.id
    });
  }

  private setupData(activity) {
    let topData = [];
    let baseData = [];
    let mapData = this.initMap(activity);
    let color = getCategoryColor(activity.categorization.activity_type);

    let format = 'HH:mm';

    if (!this.isDashboard) {
      format = 'DD. MMM YYYY HH:mm'
    }

    topData.push({
      name: 'Time',
      value: moment(activity.date).format(format) + ' Uhr',
    });

    topData.push({
      name: 'Name',
      value: activity.name,
    });

    baseData.push({
      name: 'Distanz',
      value: formatDistance(activity.base_data.distance, FormatDistanceType.Kilometers).toFixed(2) + 'km',
      icon: ContentBoxIcons.Distance,
    });

    baseData.push({
      name: 'ø Pace',
      value: formatPace(activity.average_data.speed, FormatPaceType.MinPerKm).formattedVal + '/km',
      icon: ContentBoxIcons.Pace,
    });

    baseData.push({
      name: 'ø Herzfrequenz',
      value: activity.average_data.heartrate.toFixed(0) + 'bpm',
      icon: ContentBoxIcons.Heartrate,
    });

    return {
      top: topData,
      map: mapData,
      base: baseData,
      color: color,
    }
  }

  private initMap(activity) {
    let polyline = null;
    let bounds = null;
    if (activity.map.map.summary_polyline) {
      polyline = L.polyline(decodePolyline(activity.map.map.summary_polyline));
      bounds = polyline.getBounds();
    }

    return {
      url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      live: 'https://api.mapbox.com/styles/v1/hendrikcammann/cj7ab0l1w8yzp2ss6i2w69j67/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVuZHJpa2NhbW1hbm4iLCJhIjoiY2oyNHpoZHlvMDA1eTMzbzVwOWNyNjd4MCJ9.-19NU5n0lJHJoe_0fayULA\n',
      attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      latLngs: decodePolyline(activity.map.map.summary_polyline),
      bounds: bounds,
      polylineColor: getCategoryColor(activity.categorization.activity_type),
    }
  }
}
