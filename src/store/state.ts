import {ActivityModel} from '../models/Activity/ActivityModel';
import {FilterModel} from '../models/Filter/FilterModel';
import {LoadingStatus, loadingStatus} from '../models/App/AppStatus';
import {UserModel} from '../models/User/UserModel';
import {ClusterItem, ClusterWrapper} from '../models/State/StateModel';
import {CompareModel} from '../models/Compare/CompareModel';

export enum RunType {
  All = 'All',
  Run = 'Run',
  TempoRun = 'TempoRun',
  LongRun = 'LongRun',
  ShortIntervals = 'ShortIntervals',
  LongIntervals = 'LongIntervals',
  Competition = 'Competition',
  Regeneration = 'Regeneration',
  Uncategorized = 'Uncategorized',
}

export enum DisplayType {
  Distance = 'Distance',
  Intensity = 'Intensity',
  Duration = 'Duration',
  Heartrate = 'Heartrate',
  Pace = 'Pace',
}

export enum DashboardViewType {
  Day = 'Day',
  Week = 'Week',
  Month = 'Month',
  Preparation = 'Preparation',
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
  public selectedTrainingClusters: string[];

  public currentPreparation: string;

  public sortedLists: any;
  public existingClusters: ClusterItem[];

  public filter: FilterModel;
  public dashboardViewType: DashboardViewType;

  public compare: CompareModel;

  constructor() {
    this.user = new UserModel();
    this.appLoadingStatus = new LoadingStatus();

    this.sortedLists = { All: new ClusterWrapper()};

    this.existingClusters = [];

    this.currentPreparation = 'Frankfurt-2018';

    this.activityList = [];

    this.dashboardViewType = DashboardViewType.Day;

    this.selectedActivityId = null;

    this.compare = new CompareModel();

    this.filter = new FilterModel();

  }
}

const state = new State();
export default state;
