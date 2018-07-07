import {ClusterType, DisplayType, RunType} from '../../store/state';
import {disconnect} from 'cluster';

export enum TimeRangeType {
  Week = 'Week',
  Month = 'Month',
  Individual = 'Individual',
  None = 'None',
}

export enum DistanceRangeType {
  g10 = 'greater 10',
  g25 = 'greater 25',
  Individual = 'Individual',
  None = 'None',
}

export class TimeRangeModel {
  start: Date;
  end: Date;
  isRange: boolean;
  rangeType: TimeRangeType;

  constructor() {
    this.start = new Date(1970);
    this.end = new Date();
    this.isRange = false;
    this.rangeType = TimeRangeType.None;
  }
}

export class DistanceRangeModel {
  start: number;
  end: number;
  isRange: boolean;
  rangeType: DistanceRangeType;

  constructor() {
    this.start = 0;
    this.end = 10000000;
    this.isRange = false;
    this.rangeType = DistanceRangeType.None;
  }
}

export class FilterModel {
  selectedRunType: RunType;
  selectedCluster: ClusterType;
  selectedTrainingCluster: string;
  selectedRunTypTrainingCluster: RunType;
  selectedDisplayType: DisplayType;
  timeRange: TimeRangeModel;
  showEverything: boolean;
  distanceRange: DistanceRangeModel;

  constructor() {
    this.selectedRunType = RunType.All;
    this.selectedCluster = ClusterType.ByMonths;
    this.timeRange = new TimeRangeModel();
    this.selectedTrainingCluster = 'All';
    this.selectedDisplayType = DisplayType.Distance;
    this.selectedRunTypTrainingCluster = RunType.All;
    this.showEverything = true;
    this.distanceRange = new DistanceRangeModel();
  }
}
