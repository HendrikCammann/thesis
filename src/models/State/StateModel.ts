import {ActivityClusterTypeCountModel} from '../Activity/ActivityClusterModel';

export class ClusterItem {
  clusterName: string;
  isIndividual: boolean;
  timeRange: {
    start: Date,
    end: Date,
  };

  constructor(name, individual, timeRange) {
    this.clusterName = name;
    this.isIndividual = individual;
    this.timeRange = timeRange;
  }
}

class ClusterStatsModel {
  distance: number;
  time: number;
  count: number;
  typeCount: ActivityClusterTypeCountModel;

  constructor() {
    this.distance = null;
    this.time = null;
    this.count = null;
    this.typeCount = new ActivityClusterTypeCountModel();
  }
}

export class ClusterWrapper {
  stats: ClusterStatsModel;
  unsorted: any;
  byYears: any;
  byMonths: any;
  byWeeks: any;

  constructor() {
    this.stats = new ClusterStatsModel();
    this.unsorted = {};
    this.byYears = {};
    this.byMonths = {};
    this.byWeeks = {};
  }
}
