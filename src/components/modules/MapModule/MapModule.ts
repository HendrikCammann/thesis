/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {LMap, LTileLayer, LPolyline} from 'vue2-leaflet';
import L from 'leaflet'
import {LoadingStatus, loadingStatus} from '../../../models/App/AppStatus';
import {ActivityModel} from '../../../models/Activity/ActivityModel';
import {decodePolyline} from '../../../utils/map/map';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';

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

  @Prop()
  activity: any;

  @Watch('loaded.activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loaded.activities === loadingStatus.Loaded) {
      this.initMap(this.activity);
    }
  }

  private initMap(activity: ActivityModel) {
    let polyline = L.polyline(decodePolyline(activity.map.map.summary_polyline));
    this.mapOptions.bounds = polyline.getBounds();
    this.mapOptions.latLngs = decodePolyline(activity.map.map.summary_polyline);
    this.mapOptions.polylineColor = getCategoryColor(activity.categorization.activity_type);

  }

  private mapOptions = {
    url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    live: 'https://api.mapbox.com/styles/v1/hendrikcammann/cj7ab0l1w8yzp2ss6i2w69j67/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVuZHJpa2NhbW1hbm4iLCJhIjoiY2oyNHpoZHlvMDA1eTMzbzVwOWNyNjd4MCJ9.-19NU5n0lJHJoe_0fayULA\n',
    attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    latLngs: [],
    bounds: null,
    polylineColor: '#454545',
    marker: L.latLng(47.413220, -1.219482),
  };

  mounted() {
    this.initMap(this.activity);
  }
}
