import {ActivityModel} from '../Activity/ActivityModel';

export class CompareModel {
  showAbsolute: boolean;
  selectedTrainingClusters: string[];
  shownBars: ActivityModel[];
  selectedTimeRange: number[];

  constructor() {
    this.showAbsolute = true;
    this.selectedTrainingClusters = ['Kandel-2017', 'Karlsruhe-2017', 'Hannover-2018'];
    this.shownBars = [];
    this.selectedTimeRange = [0, 1140];
  }
}
