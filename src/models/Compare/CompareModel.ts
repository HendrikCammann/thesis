export class CompareModel {
  showAbsolute: boolean;
  selectedTrainingClusters: string[];

  constructor() {
    this.showAbsolute = true;
    this.selectedTrainingClusters = ['Barcelona-2018', 'Karlsruhe-2017'];
  }
}
