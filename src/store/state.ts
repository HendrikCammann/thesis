import {ActivityModel} from '../models/Activity/ActivityModel';
import {FilterModel} from '../models/Filter/FilterModel';
import {LoadingStatus, loadingStatus} from '../models/App/AppStatus';
import {UserModel} from '../models/User/UserModel';
import {ClusterItem} from '../models/State/StateModel';

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
  public user: UserModel;

  public activityList: ActivityModel[];
  public selectedActivityId: number;

  public sortedLists: Object;
  public existingClusters: ClusterItem[];

  public filter: FilterModel;
  public dashboardFilter: FilterModel;

  constructor() {
    this.user = new UserModel();
    this.appLoadingStatus = new LoadingStatus();

    this.sortedLists = {};

    this.existingClusters = [];

    this.activityList = [];

    this.selectedActivityId = null;

    this.filter = new FilterModel();

    this.dashboardFilter = new FilterModel();
    this.dashboardFilter.selectedCluster = ClusterType.ByWeeks;
    this.dashboardFilter.showEverything = false;
    this.dashboardFilter.timeRange.isRange = true;
    this.dashboardFilter.timeRange.end = new Date();
    this.dashboardFilter.timeRange.start = new Date(this.dashboardFilter.timeRange.end.getFullYear(), this.dashboardFilter.timeRange.end.getMonth(), this.dashboardFilter.timeRange.end.getDay() - 14);
  }
}

const state = new State();
export default state;
