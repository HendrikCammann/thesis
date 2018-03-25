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

export class State {
  public count: number;
  public listItem: ListItem[];
  public runningRaces: any[];
  public activityList: ActivityModel[];
  public selectedActivityId: number;
  public acitvitySortedLists: {
    byMonths: null,
    byWeeks: null,
    byYears: null
  };

  public selectedRunType: RunType;

  constructor() {
    this.count = 0;
    this.listItem = [];
    this.runningRaces = [];
    this.activityList = [];
    this.acitvitySortedLists = {
      byMonths: null,
      byWeeks: null,
      byYears: null
    };
    this.selectedActivityId = null;

    this.selectedRunType = RunType.All;
  }
}

const state = new State();
export default state;
