import {ActivityModel} from '../Activity/ActivityModel';

export class CompareModel {
  showAbsolute: boolean;
  selectedTrainingClusters: string[];
  selectedWeeks: any[];
  shownBars: ActivityModel[];
  selectedTimeRange: number[];
  timeRanges: any[];

  constructor() {
    this.showAbsolute = true;
    this.selectedTrainingClusters = ['Fulda-2016', 'Karlsruhe-2017', 'Barcelona-2018'];
    this.selectedWeeks = [];
    this.shownBars = [];
    this.selectedTimeRange = [0, 1140];
    this.timeRanges = [
      {
        start: 0,
        end: 1140
      },
      {
        start: 0,
        end: 1140
      },
      {
        start: 0,
        end: 1140
      },
    ];
  }
}
