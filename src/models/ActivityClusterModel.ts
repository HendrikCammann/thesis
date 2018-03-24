class ActivityClusterTypeCountModel {
  run: number;
  longRun: number;
  interval: number;
  competition: number;
  uncategorized: number;

  constructor() {
    this.run = 0;
    this.longRun = 0;
    this.interval = 0;
    this.competition = 0;
    this.uncategorized = 0;
  }
}

class ActivityClusterStatsModel {
  distance: number;
  time: number;
  typeCount: ActivityClusterTypeCountModel;

  constructor() {
    this.distance = null;
    this.time = null;
    this.typeCount = new ActivityClusterTypeCountModel();
  }
}

export class ActivityClusterModel {
  rangeName: string;
  activities: number[];
  stats: ActivityClusterStatsModel;

  constructor() {
    this.activities = [];
    this.stats = new ActivityClusterStatsModel();
  }
}
