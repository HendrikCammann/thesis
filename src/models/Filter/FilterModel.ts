import {ClusterType, DisplayType, RunType} from '../../store/state';

export class TimeRangeModel {
  start: Date;
  end: Date;
  isRange: boolean;

  constructor() {
    this.start = new Date(1970);
    this.end = new Date();
    this.isRange = false;
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
    this.selectedDisplayType = DisplayType.Duration;
    this.selectedRunTypTrainingCluster = RunType.All;
    this.showEverything = true;
  }
}
