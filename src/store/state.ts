import {ActivityModel} from '../models/Activity/ActivityModel';
import {FilterModel} from '../models/Filter/FilterModel';
import {LoadingStatus, loadingStatus} from '../models/App/AppStatus';

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
  public appLoadingStatus: LoadingStatus;

  public activityList: ActivityModel[];
  public selectedActivityId: number;
  public acitvitySortedLists: {
    byMonths: null,
    byWeeks: null,
    byYears: null,
    all: null
  };
  public filter: FilterModel;

  public selectedRunType: RunType;
  public selectedCluster: ClusterType;

  constructor() {
    this.appLoadingStatus = new LoadingStatus();

    this.activityList = [];
    this.acitvitySortedLists = {
      byMonths: null,
      byWeeks: null,
      byYears: null,
      all: null
    };
    this.selectedActivityId = null;

    this.filter = new FilterModel();

    this.selectedRunType = RunType.All;

    this.selectedCluster = ClusterType.ByMonths;
  }
}

const state = new State();
export default state;
