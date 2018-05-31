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
import {Button} from '../../partials/Button';
import {getDayName} from '../../../utils/time/time-formatter';
import {TagItem} from '../../partials/TagItem';

@Component({
  template: require('./lastRunModule.html'),
  components: {
    'leafletMap': LMap,
    'leafletTilelayer': LTileLayer,
    'leafletPolyline': LPolyline,
    'buttonMain': Button,
    'tagItem': TagItem,
  }
})
export class LastRunModule extends Vue {
  @Prop()
  activities: any[];

  @Prop()
  loaded: LoadingStatus;

  private data: any = null;

  private mapOptions = {
    url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    live: 'https://api.mapbox.com/styles/v1/hendrikcammann/cjg9ebjs37epx2rn6sw6evmow/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVuZHJpa2NhbW1hbm4iLCJhIjoiY2oyNHpoZHlvMDA1eTMzbzVwOWNyNjd4MCJ9.-19NU5n0lJHJoe_0fayULA\n',
    attribution:'',
    center: L.latLng(47.413220, -1.219482),
    zoom: 3,
    polylineBgColor: '#F4F4F4',
    polylineColor: '#454545',
    textColor: '#454545',
  };

  @Watch('loaded.activities')
  @Watch('activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loaded.activities === loadingStatus.Loaded) {
      this.data = this.initData(this.activities);
    }
  }

  mounted() {
    if (this.loaded.activities === loadingStatus.Loaded) {
      this.data = this.initData(this.activities);
      console.log(this.data);
    }
  }

  private initData(activities) {
    let returnArr = [];
    activities.forEach(item => {
      if (item.length) {
        item.forEach(ac => {
          let item = {
            ac: null,
            map: null,
          };
          item.ac = ac;
          item.map = this.initMap(ac);
          returnArr.push(item);
        })
      }
    });
    returnArr.reverse();
    return returnArr;
  }

  private initMap(activity) {
    let polyline = L.polyline(decodePolyline(activity.map.map.summary_polyline));
    let textColor = getCategoryColor(activity.categorization.activity_type);
    let bounds = polyline.getBounds();
    let latLngs = decodePolyline(activity.map.map.summary_polyline);

    return {
      textColor: textColor,
      bounds: bounds,
      latLngs: latLngs,
    };
  }

  private getDayName(date) {
    let day = new Date(date).getDay();
    return getDayName(day, false);
  }


  private handleClick(id): void {
    event.preventDefault();
    eventBus.$emit(navigationEvents.open_Activity_Detail, id);
  }
}
