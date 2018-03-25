import {ActivityModel} from '../models/ActivityModel';

export interface ListItem {
  id: number;
  name: string;
}

export enum RunType {
  All = 'All',
  Run = 'Run',
  TempoRun = 'Tempo run',
  LongRun = 'Long run',
  ShortIntervals = 'Short intervals',
  LongIntervals = 'Long intervals',
  Competition = 'Competition',
  Regeneration = 'Regeneration',
  Uncategorized = 'Uncategorized',
}

export enum ClusterType {
  All = 'All',
  ByYears = 'ByYears',
  ByMonths = 'ByMonths',
  ByWeeks = 'ByWeeks'
}

export class State {
  public count: number;
  public listItem: ListItem[];
  public runningRaces: any[];
  public activityList: ActivityModel[];
  public selectedActivityId: number;
  public acitvitySortedLists: {
    byMonths: null,
    byWeeks: null,
    byYears: null,
    all: null
  };

  public selectedRunType: RunType;
  public selectedCluster: ClusterType;

  constructor() {
    this.count = 0;
    this.listItem = [];
    this.runningRaces = [];
    this.activityList = [];
    this.acitvitySortedLists = {
      byMonths: null,
      byWeeks: null,
      byYears: null,
      all: null
    };
    this.selectedActivityId = null;

    this.selectedRunType = RunType.All;

    this.selectedCluster = ClusterType.ByYears;
  }
}

const state = new State();
export default state;
