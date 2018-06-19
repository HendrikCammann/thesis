import {ClusterType, DisplayType, RunType} from '../../store/state';

export enum TimeRangeType {
  Week = 'Week',
  Month = 'Month',
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

export class FilterModel {
  selectedRunType: RunType;
  selectedCluster: ClusterType;
  selectedTrainingCluster: string;
  selectedRunTypTrainingCluster: RunType;
  selectedDisplayType: DisplayType;
  timeRange: TimeRangeModel;
  showEverything: boolean;

  constructor() {
    this.selectedRunType = RunType.All;
    this.selectedCluster = ClusterType.ByMonths;
    this.timeRange = new TimeRangeModel();
    this.selectedTrainingCluster = 'All';
    this.selectedDisplayType = DisplayType.Distance;
    this.selectedRunTypTrainingCluster = RunType.All;
    this.showEverything = true;
  }
}
