export class CompareModel {
  showAbsolute: boolean;
  selectedTrainingClusters: string[];

  constructor() {
    this.showAbsolute = true;
    this.selectedTrainingClusters = ['Frankfurt-2018', 'Hannover-2018'];
  }
}
