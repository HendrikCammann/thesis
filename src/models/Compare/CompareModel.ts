export class CompareModel {
  showAbsolute: boolean;
  selectedTrainingClusters: string[];

  constructor() {
    this.showAbsolute = true;
    this.selectedTrainingClusters = ['Fulda-2016', 'Karlsruhe-2017'];
  }
}
