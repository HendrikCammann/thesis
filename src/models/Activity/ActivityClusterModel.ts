import {RunType} from '../../store/state';

class TypeCountModel {
  amount: number;
  distance: number;
  type: RunType;
  activities: number[];
  duration: number;
  intensity: number;

  constructor() {
    this.amount = 0;
    this.distance = 0;
    this.duration = 0;
    this.intensity = 0;
    this.type = null;
    this.activities = [];
  }
}

export class ActivityClusterTypeCountModel {
  run: TypeCountModel;
  longRun: TypeCountModel;
  interval: TypeCountModel;
  competition: TypeCountModel;
  uncategorized: TypeCountModel;

  constructor() {
    this.run = new TypeCountModel();
    this.longRun = new TypeCountModel();
    this.interval = new TypeCountModel();
    this.competition = new TypeCountModel();
    this.uncategorized = new TypeCountModel();
  }
}

class ActivityClusterStatsModel {
  distance: number;
  time: number;
  intensity: number;
  count: number;
  typeCount: ActivityClusterTypeCountModel;

  constructor() {
    this.distance = null;
    this.intensity = null;
    this.time = null;
    this.count = null;
    this.typeCount = new ActivityClusterTypeCountModel();
  }
}

export class ActivityClusterModel {
  rangeName: string;
  rangeDate: Date;
  activities: number[];
  stats: ActivityClusterStatsModel;

  constructor() {
    this.activities = [];
    this.stats = new ActivityClusterStatsModel();
  }
}
