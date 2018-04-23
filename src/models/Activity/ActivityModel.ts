import {ActivityDetailModel} from './ActivityDetailModel';
import {ActivityStreamModel} from './ActivityStreamModel';
import {ActivityZoneModel} from './ActivityZoneModel';
import {RunType} from '../../store/state';
import {ClusterItem} from '../State/StateModel';

class ActivityControls {
  public has_heartrate: boolean;

  constructor() {
    this.has_heartrate = null;
  }
}

class ActivityAverageData {
  public heartrate: number;
  public speed: number;
  public cadence: number;

  constructor() {
    this.cadence = null;
    this.speed = null;
    this.cadence = null;
  }
}

class ActivityBaseData {
  public distance: number;
  public duration: number;
  public elevation_up: number;
  public elevation_down: number;
  public elevation_gain: number;
  public suffer_score: number;

  constructor() {
    this.distance = null;
    this.duration = null;
    this.elevation_up = null;
    this.elevation_down = null;
    this.elevation_gain = null;
    this.suffer_score = null;
  }
}

class ActivityMaxData {
  public heartrate: number;
  public speed: number;

  constructor() {
    this.heartrate = null;
    this.speed = null;
  }
}

class ActivityCategorization {
  public cluster_anchor_month: string;
  public cluster_anchor_year: string;
  public clusters_anchors: ClusterItem[];
  public type: string;
  public activity_type: RunType;

  constructor() {
    this.cluster_anchor_month = null;
    this.cluster_anchor_year = null;
    this.clusters_anchors = [];
    this.type = null;
    this.activity_type = RunType.Uncategorized;
  }
}

class ActivityMap {
  public map: any;
  public start_latlng: any;
  public end_latlng: any;

  constructor() {
    this.map = null;
    this.start_latlng = null;
    this.end_latlng = null;
  }
}

export class ActivityModel {
  public id: number;
  public name: string;
  public date: string;
  public controls: ActivityControls;
  public average_data: ActivityAverageData;
  public base_data: ActivityBaseData;
  public max_data: ActivityMaxData;
  public categorization: ActivityCategorization;
  public map: ActivityMap;
  public details: ActivityDetailModel;
  public streams: ActivityStreamModel;
  public zones: ActivityZoneModel;

  constructor() {
    this.id = null;
    this.name = null;
    this.date = null;

    this.controls = new ActivityControls();

    this.average_data = new ActivityAverageData();

    this.base_data = new ActivityBaseData();

    this.max_data = new ActivityMaxData();

    this.categorization = new ActivityCategorization();

    this.map = new ActivityMap();

    this.details = null;
    this.streams = null;
    this.zones = null;
  }
}
