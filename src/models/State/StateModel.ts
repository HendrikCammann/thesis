import {ActivityClusterTypeCountModel} from '../Activity/ActivityClusterModel';
import {getWeeksBetweenDates} from '../../utils/time/time-formatter';

export enum ClusterTypes {
  Halfmarathon = 'Halbmarathon',
  Marathon = 'Marathon',
  TenK = '10 km'
}

export class ClusterItem {
  clusterName: string;
  id: string;
  isIndividual: boolean;
  timeRange: {
    start: Date,
    end: Date,
  };
  duration: any;
  type: ClusterTypes;

  constructor(name, id, individual, timeRange, type) {
    this.clusterName = name;
    this.id = id;
    this.isIndividual = individual;
    this.timeRange = timeRange;
    this.duration = getWeeksBetweenDates(timeRange.end, timeRange.start);
    this.type = type;
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
