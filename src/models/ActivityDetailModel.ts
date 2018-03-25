import {RunType} from '../store/state';

class ActivityDetailAverageData {
  public heartrate: number;
  public speed: number;
  public cadence: number;

  constructor() {
    this.heartrate = null;
    this.speed = null;
    this.cadence = null;
  }
}

class ActivityDetailBaseData {
  public calories: number;
  public distance: number;
  public duration: number;
  public elevation_up: number;
  public elevation_down: number;
  public elevation_gain: number;
  public suffer_score: number;

  constructor() {
    this.calories = null;
    this.distance = null;
    this.duration = null;
    this.elevation_up = null;
    this.elevation_down = null;
    this.elevation_gain = null;
    this.suffer_score = null;
  }
}

class ActivityDetailControls {
  public has_heartrate: boolean;

  constructor() {
    this.has_heartrate = null;
  }
}

class ActivityDetailMaxData {
  public heartrate: number;
  public speed: number;

  constructor() {
    this.heartrate = null;
    this.speed = null;
  }
}

class ActivityDetailMap {
  public map: any;
  public start_latlng: any;
  public end_latlng: any;

  constructor() {
    this.map = null;
    this.start_latlng = null;
    this.end_latlng = null;
  }
}

class ActivityDetailSplits {
  public metric: any[];
  public standard: any[];
}

class ActivityDetailCategorization {
  public type: string;
  public activity_type: RunType;

  constructor() {
    this.type = null;
    this.activity_type = RunType.Uncategorized;
  }
}


export class ActivityDetailModel {
  public id: number;
  public description: string;
  public date: string;
  public controls: ActivityDetailControls;
  public categorization: ActivityDetailCategorization;
  public average_data: ActivityDetailAverageData;
  public base_data: ActivityDetailBaseData;
  public max_data: ActivityDetailMaxData;
  public map: ActivityDetailMap;
  public distance_efforts: any[];
  public laps: any[];
  public similar_activities: any;
  public splits: ActivityDetailSplits;

  constructor() {
    this.id = null;
    this.description = null;
    this.date = null;
    this.controls = new ActivityDetailControls();
    this.categorization = new ActivityDetailCategorization();
    this.average_data = new ActivityDetailAverageData();
    this.base_data = new ActivityDetailBaseData();
    this.max_data = new ActivityDetailMaxData();
    this.map = new ActivityDetailMap();
    this.distance_efforts = null;
    this.laps = null;
    this.similar_activities = null;
    this.splits = new ActivityDetailSplits();
  }
}
