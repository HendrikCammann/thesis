/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {LMap, LTileLayer, LPolyline} from 'vue2-leaflet';
import L from 'leaflet'
import {LoadingStatus, loadingStatus} from '../../../models/App/AppStatus';
import {ActivityModel} from '../../../models/Activity/ActivityModel';
import {formatDistance, formatPace} from '../../../utils/format-data';
import {FormatDistanceType, FormatDurationType, FormatPaceType} from '../../../models/FormatModel';
import {formatSecondsToDuration} from '../../../utils/time/time-formatter';
import {MapOverlayItem} from '../../partials/MapOverlayItem';

@Component({
  template: require('./mapModule.html'),
  components: {
    'leafletMap': LMap,
    'leafletTilelayer': LTileLayer,
    'leafletPolyline': LPolyline,
    'mapOverlayItem': MapOverlayItem,
  }
})
export class MapModule extends Vue {
  @Prop()
  loaded: LoadingStatus;

  private ac = null;
  private overlayData = null;

  @Watch('loaded.activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loaded.activities === loadingStatus.Loaded) {
      this.ac = this.$store.getters.getLatestActivity;
      this.initMap(this.ac);
    }
  }

  private initMap(activity: ActivityModel) {
    this.overlayData = this.initOverlayData(activity);
    let polyline = L.polyline(this.decodePolyline(activity.map.map.summary_polyline));
    this.mapOptions.bounds = polyline.getBounds();
    this.mapOptions.latLngs = this.decodePolyline(activity.map.map.summary_polyline);
  }

  private initOverlayData(activity: ActivityModel) {
    return {
      distance: formatDistance(activity.base_data.distance, FormatDistanceType.Kilometers).toFixed(2) + 'km',
      duration: formatSecondsToDuration(activity.base_data.duration, FormatDurationType.Minutes).multilple,
      heartrate: Math.round(activity.average_data.heartrate) + ' BPM',
      speed: formatPace(activity.average_data.speed, FormatPaceType.MinPerKm).formattedVal + '/km',
    }
  }


  private mapOptions = {
    url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    live: 'https://api.mapbox.com/styles/v1/hendrikcammann/cj7ab0l1w8yzp2ss6i2w69j67/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVuZHJpa2NhbW1hbm4iLCJhIjoiY2oyNHpoZHlvMDA1eTMzbzVwOWNyNjd4MCJ9.-19NU5n0lJHJoe_0fayULA\n',
    attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    latLngs: [],
    bounds: null,
    marker: L.latLng(47.413220, -1.219482),
  };

  private decodePolyline(encoded) {

    // array that holds the points

    let points=[ ];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;
    while (index < len) {
      let b, shift = 0, result = 0;
      do {

        b = encoded.charAt(index++).charCodeAt(0) - 63;//finds ascii                                                                                    //and substract it by 63
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);


      let dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push([(lat / 1E5), (lng / 1E5)])

    }
    return points
  }
}
