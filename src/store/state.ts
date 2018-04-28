import {ActivityModel} from '../models/Activity/ActivityModel';
import {FilterModel} from '../models/Filter/FilterModel';
import {LoadingStatus, loadingStatus} from '../models/App/AppStatus';
import {UserModel} from '../models/User/UserModel';
import {ClusterItem} from '../models/State/StateModel';
const stravaData = require('../stravadatabase/object.json');

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

const blackList = ['index', 'id', 'name', 'date', 'updated_at', 'created_at'];
const killList = ['index', 'updated_at', 'created_at'];

function reformatJSON(data) {
  for (let item in data) {
    for (let key in data[item]) {
      if (blackList.indexOf(key) < 0) {
        data[item][key] = JSON.parse(data[item][key]);
      }
    }
  }

  for (let item in data) {
    for (let key in data[item]) {
      if (killList.indexOf(key) >= 0) {
        delete data[item][key];
      }
    }
  }

  return data;
}

export class State {
  public appLoadingStatus: LoadingStatus;
  public user: UserModel;

  public activityList: ActivityModel[];
  public selectedActivityId: number;
  public selectedTrainingClusters: string[];

  public sortedLists: Object;
  public existingClusters: ClusterItem[];

  public filter: FilterModel;
  public dashboardFilter: FilterModel;

  public localActivities: ActivityModel[];

  constructor() {
    this.user = new UserModel();
    this.appLoadingStatus = new LoadingStatus();

    this.sortedLists = {};

    this.existingClusters = [];

    this.activityList = [];

    this.selectedActivityId = null;

    this.selectedTrainingClusters = ['Karlsruhe-2017', 'Kandel-2017'];

    this.localActivities = reformatJSON(stravaData);

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
