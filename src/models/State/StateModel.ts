export class ClusterItem {
  clusterName: string;
  isIndividual: boolean;
  timeRange: {
    start: Date,
    end: Date,
  };

  constructor(name, individual, timeRange) {
    this.clusterName = name;
    this.isIndividual = individual;
    this.timeRange = timeRange;
  }
}

export class ClusterWrapper {
  unsorted: any;
  byYears: any;
  byMonths: any;
  byWeeks: any;
}
