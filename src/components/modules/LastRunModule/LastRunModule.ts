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
  activity: any[];

  @Prop()
  loaded: LoadingStatus;

  @Prop()
  index: number;

  private selectedActivity = 0;

  private mapOptions = {
    url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    live: 'https://api.mapbox.com/styles/v1/hendrikcammann/cj7ab0l1w8yzp2ss6i2w69j67/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGVuZHJpa2NhbW1hbm4iLCJhIjoiY2oyNHpoZHlvMDA1eTMzbzVwOWNyNjd4MCJ9.-19NU5n0lJHJoe_0fayULA\n',
    attribution:'',
    center: L.latLng(47.413220, -1.219482),
    latLngs: [],
    zoom: 3,
    bounds: null,
    polylineBgColor: '#F4F4F4',
    polylineColor: '#454545',
    textColor: '#454545',
  };

  @Watch('loaded.activities')
  @Watch('selectedActivity')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loaded.activities === loadingStatus.Loaded) {
      this.initMap(this.activity[this.selectedActivity]);
    }
  }

  mounted() {
    if (this.loaded.activities === loadingStatus.Loaded && this.activity.length) {
      this.initMap(this.activity[this.selectedActivity]);
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

  private checkFuture(): boolean {
    let date = new Date().getDay();
    let _index;
    if (this.index === 6) {
      _index = 0;
    } else {
      _index = this.index + 1;
    }
    console.log(_index, date);
    return _index > date;
  }

  private isToday(): boolean {
    let _index;
    if (this.index === 6) {
      _index = 0;
    } else {
      _index = this.index + 1;
    }

    let date = new Date().getDay();
    return _index === date;
  }

  private handleClick(): void {
    event.preventDefault();
    console.log('in');
    if (this.activity[this.selectedActivity].id) {
      eventBus.$emit(navigationEvents.open_Activity_Detail, this.activity[this.selectedActivity].id);
    }
  }

  private getDayName() {
    let day;
    if (this.index === 6) {
      day = 0;
    } else {
      day = this.index + 1
    }
    return getDayName(day, true);
  }

  private activityCount() {
    return '+' + (this.activity.length - 1);
  }

  private colorSliderDot(index: number) {
    return index === this.selectedActivity;
  }

  private selectRun(index) {
    event.preventDefault();
    this.selectedActivity = index;
  }

  private initMap(activity: ActivityModel) {
    if (activity.name) {
      let polyline = L.polyline(decodePolyline(activity.map.map.summary_polyline));
      this.mapOptions.textColor = getCategoryColor(activity.categorization.activity_type);
      this.mapOptions.bounds = polyline.getBounds();
      this.mapOptions.latLngs = decodePolyline(activity.map.map.summary_polyline);
    }
  }
}
