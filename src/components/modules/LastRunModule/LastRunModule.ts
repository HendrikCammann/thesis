/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {LMap, LTileLayer, LPolyline} from 'vue2-leaflet';
import L from 'leaflet';
import {ActivityModel} from '../../../models/Activity/ActivityModel';
import {decodePolyline} from '../../../utils/map/map';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';
import {navigationEvents} from '../../../events/Navigation/Navigation';
import {eventBus} from '../../../main';

@Component({
  template: require('./lastRunModule.html'),
  components: {
    'leafletMap': LMap,
    'leafletTilelayer': LTileLayer,
    'leafletPolyline': LPolyline,
  }
})
export class LastRunModule extends Vue {
  @Prop()
  activity: any;

  @Prop()
  loaded: LoadingStatus;

  @Prop()
  index: number;

  private mapOptions = {
    url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    live: 'https://api.mapbox.com/styles/v1/hendrikcammann/cj7ab0l1w8yzp2ss6i2w69j67/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVuZHJpa2NhbW1hbm4iLCJhIjoiY2oyNHpoZHlvMDA1eTMzbzVwOWNyNjd4MCJ9.-19NU5n0lJHJoe_0fayULA\n',
    attribution:'',
    latLngs: [],
    bounds: null,
    marker: L.latLng(47.413220, -1.219482),
    polylineColor: '',
  };

  @Watch('loaded.activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loaded.activities === loadingStatus.Loaded) {
      this.initMap(this.activity);
    }
  }

  mounted() {
    if (this.loaded.activities === loadingStatus.Loaded) {
      this.initMap(this.activity);
    }
  }

  private activityName(name: string): string {
    // Todo use correct Date;
    // let date = new Date().getDay();
    let date = 5;
    if (name) {
      return name;
    } else {
      if (this.index <= date) {
        return 'Ruhetag';
      } else {
        return 'kommt noch';
      }
    }
  }
  private handleClick(): void {
    if (this.activity.id) {
      eventBus.$emit(navigationEvents.open_Activity_Detail, this.activity.id);
    }
  }

  private initMap(activity: ActivityModel) {
    if (activity.name) {
      let polyline = L.polyline(decodePolyline(activity.map.map.summary_polyline));
      this.mapOptions.polylineColor = getCategoryColor(activity.categorization.activity_type);
      this.mapOptions.bounds = polyline.getBounds();
      this.mapOptions.latLngs = decodePolyline(activity.map.map.summary_polyline);
    }
  }
}
