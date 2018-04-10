import {ClusterType, RunType} from '../store/state';

class TimeRangeModel {
  start: Date;
  end: Date;

  constructor() {
    this.start = null;
    this.end = new Date();
  }
}

export class FilterModel {
  selectedRunType: RunType;
  selectedCluster: ClusterType;

  timeRange: TimeRangeModel;

  constructor() {
    this.selectedRunType = RunType.All;
    this.selectedCluster = ClusterType.ByYears;
    this.timeRange = new TimeRangeModel();
  }
}
