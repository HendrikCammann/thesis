/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {LMap, LTileLayer, LPolyline} from 'vue2-leaflet';
import L from 'leaflet'
import {LoadingStatus, loadingStatus} from '../../../models/App/AppStatus';

@Component({
  template: require('./mapModule.html'),
  components: {
    'leafletMap': LMap,
    'leafletTilelayer': LTileLayer,
    'leafletPolyline': LPolyline,
  }
})
export class MapModule extends Vue {
  @Prop()
  loaded: LoadingStatus;

  @Watch('loaded.activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loaded.activities === loadingStatus.Loaded) {
      this.initMap();
    }
  }

  private initMap() {
    let ac = this.$store.getters.getLatestActivity;
    console.log(ac)
    let polyline = L.polyline(this.decodePolyline(ac.map.map.summary_polyline));
    this.mapOptions.bounds = polyline.getBounds();
    this.mapOptions.latLngs = this.decodePolyline(ac.map.map.summary_polyline);
  }


  private mapOptions = {
    // zoom: 13,
    // center: L.latLng(48.35903, 10.89401),
    url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
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
