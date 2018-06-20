import Vue from 'vue';
import {MutationTree} from 'vuex';
import {MutationTypes} from './mutation-types';
import {RunType, State} from './state';
import * as moment from 'moment';
import {ActivityModel} from '../models/Activity/ActivityModel';
import {ActivityDetailModel} from '../models/Activity/ActivityDetailModel';
import {ActivityStreamModel} from '../models/Activity/ActivityStreamModel';
import {ActivityZoneModel} from '../models/Activity/ActivityZoneModel';
import {ActivityClusterModel} from '../models/Activity/ActivityClusterModel';
import {DistanceRangeModel, DistanceRangeType, TimeRangeModel} from '../models/Filter/FilterModel';
import {loadingStatus} from '../models/App/AppStatus';
import {UserModel} from '../models/User/UserModel';
import {ClusterItem, ClusterTypes, ClusterWrapper} from '../models/State/StateModel';

enum timeRanges {
  All = 'all',
  Week = 'week',
  Month = 'month',
  Year = 'year',
  Individual = 'individual',
}

function calculateActivityIntensity(duration, avgHr) {
  let maxHr = 200;
  let restHr = 45;

  let durationInMin = duration / 60;

  let intensity = durationInMin * (avgHr - restHr) / (maxHr - restHr);

  return intensity;

}

function applyUserModel(item): UserModel {
  let user = new UserModel();

  user.firstname = item.firstname;
  user.lastname = item.lastname;
  user.sex = item.sex;
  user.profile_medium = item.profile_medium;
  user.profile = item.profile;

  return user;
}

function applyActivityModelStructure(item, oldestDate): ActivityModel {
  let activity = new ActivityModel();

  activity.id = item.id;
  activity.name = item.name;
  activity.date = item.start_date;

  activity.controls.has_heartrate = item.has_heartrate;

  activity.average_data.heartrate = item.average_heartrate;
  activity.average_data.speed = item.average_speed;
  activity.average_data.cadence = item.average_cadence;

  activity.base_data.distance = item.distance;
  activity.base_data.duration = item.moving_time;
  activity.base_data.elevation_up = item.elev_high;
  activity.base_data.elevation_down = item.elev_low;
  activity.base_data.elevation_gain = item.total_elevation_gain;
  activity.base_data.suffer_score = item.suffer_score;
  activity.base_data.intensity = calculateActivityIntensity(item.moving_time, item.average_heartrate);


  activity.max_data.heartrate = item.max_heartrate;
  activity.max_data.speed = item.max_speed;

  activity.categorization.cluster_anchor_month = new Date(item.start_date).getFullYear() + '-' + new Date(item.start_date).getMonth();
  activity.categorization.cluster_anchor_year = new Date(item.start_date).getFullYear().toString();

  let timeRange = {
    start: new Date(oldestDate),
    end: new Date(),
  };

  activity.categorization.cluster_anchors.push(new ClusterItem('All', ('All-' + timeRange.start + '-' + timeRange.end).replace(/\s+/g, ''), false, timeRange, ClusterTypes.Halfmarathon, 1564934153));

  let temp = new Date(activity.date);

  if (temp <= new Date(2018, 10, 28) && temp >= new Date(2018, 4, 7)) {
    let range = {
      start: new Date(2018, 4, 7),
      end: new Date(2018, 9, 28),
    };
    activity.categorization.cluster_anchors.push(new ClusterItem('Frankfurt-2018', ('Frankfurt-2018-' + range.start + '-' + range.end).replace(/\s+/g, ''), true, range, ClusterTypes.Marathon, 1187823373));
  }

  if (temp <= new Date(2017, 8, 19) && temp >= new Date(2017, 4, 19)) {
    let range = {
      start: new Date(2017, 4, 19),
      end: new Date(2017, 8, 20),
    };
    activity.categorization.cluster_anchors.push(new ClusterItem('Karlsruhe-2017', ('Karlsruhe-2017-' + range.start + '-' + range.end).replace(/\s+/g, ''), true, range, ClusterTypes.Halfmarathon, 1187823373));
  }

  if (temp <= new Date(2018, 1, 11) && temp >= new Date(2017, 10, 11)) {
    let range = {
      start: new Date(2017, 10, 11),
      end: new Date(2018, 1, 12),
    };
    activity.categorization.cluster_anchors.push(new ClusterItem('Barcelona-2018', ('Barcelona-2018-' + range.start + '-' + range.end).replace(/\s+/g, ''), true, range, ClusterTypes.Halfmarathon, 1401989504));
  }

  if (temp <= new Date(2017, 2, 12) && temp >= new Date(2016, 9, 12)) {
    let range = {
      start: new Date(2016, 9, 12),
      end: new Date(2017, 2, 13),
    };
    activity.categorization.cluster_anchors.push(new ClusterItem('Kandel-2017', ('Kandel-2017-' + range.start + '-' + range.end).replace(/\s+/g, ''), true, range, ClusterTypes.Halfmarathon, 897076217));
  }

  if (temp <= new Date(2018, 3, 9) && temp >= new Date(2017, 10, 8)) {
    let range = {
      start: new Date(2017, 10, 8),
      end: new Date(2018, 3, 9),
    };
    activity.categorization.cluster_anchors.push(new ClusterItem('Hannover-2018', ('Hannover-2018-' + range.start + '-' + range.end).replace(/\s+/g, ''), true, range, ClusterTypes.Halfmarathon, 1496287411));
  }

  activity.categorization.type = item.type;
  switch (item.workout_type) {
    case 0:
      activity.categorization.activity_type = RunType.Run;
      break;
    case 1:
      activity.categorization.activity_type = RunType.Competition;
      break;
    case 2:
      activity.categorization.activity_type = RunType.LongRun;
      break;
    case 3:
      activity.categorization.activity_type = RunType.ShortIntervals;
      break;
    default:
      activity.categorization.activity_type = RunType.Uncategorized;
  }

  activity.map.map = item.map;
  activity.map.start_latlng = item.start_latlng;
  activity.map.end_latlng = item.end_latlng;

  activity.details = null;

  activity.streams = null;

  return activity;
}

function applyActivityDetailModelStructure(item): ActivityDetailModel {
  let details = new ActivityDetailModel();
  details.id = item.id;
  details.description = item.description;
  details.date = item.start_date;

  details.controls.has_heartrate = item.has_heartrate;
  switch (item.workout_type) {
    case 0:
      details.categorization.activity_type = RunType.Run;
      break;
    case 1:
      details.categorization.activity_type = RunType.Competition;
      break;
    case 2:
      details.categorization.activity_type = RunType.LongRun;
      break;
    case 3:
      details.categorization.activity_type = RunType.ShortIntervals;
      break;
    default:
      details.categorization.activity_type = RunType.Uncategorized;
  }
  details.categorization.type = item.type;

  details.average_data.heartrate = item.average_heartrate;
  details.average_data.speed = item.average_speed;
  details.average_data.cadence = item.average_cadence;

  details.base_data.calories = item.calories;
  details.base_data.distance = item.distance;
  details.base_data.duration = item.moving_time;
  details.base_data.elevation_up = item.elev_high;
  details.base_data.elevation_down = item.elev_low;
  details.base_data.elevation_gain = item.total_elevation_gain;
  details.base_data.suffer_score = item.suffer_score;

  details.max_data.heartrate = item.max_heartrate;
  details.max_data.speed = item.max_speed;

  details.map.map = item.map;
  details.map.start_latlng = item.start_latlng;
  details.map.end_latlng = item.end_latlng;

  details.distance_efforts = item.best_efforts;

  details.laps = item.laps;

  details.similar_activities = item.similar_activities;

  details.splits.metric = item.splits_metric;
  details.splits.standard = item.splits_standard;

  return details;
}

function applyActivityStreamModelStructure(item): ActivityStreamModel {
  let streams = new ActivityStreamModel();

  item.map(item => {
    switch (item.type) {
      case 'distance':
        streams.distance = item;
        break;
      case 'heartrate':
        streams.heartrate = item;
        break;
      case 'altitude':
        streams.altitude = item;
        break;
      case 'cadence':
        streams.cadence = item;
        break;
      case 'velocity_smooth':
        streams.speed = item;

    }
  });

  return streams;
}

function applyActivityZoneModelStructure(item): ActivityZoneModel {
  let zones = new ActivityZoneModel();

  item.map(item => {
    switch (item.type) {
      case 'heartrate':
        zones.heartrate = item;
        break;
      case 'pace':
        zones.pace = item;
        break;
    }
  });

  return zones;
}

function sortActivities (array, bucket) {
  let timeRange;

  return array.reduce( function (acc, activity, i) {

    switch (bucket) {
      case timeRanges.All:
        timeRange = 'all';
        break;
      case timeRanges.Week:
        timeRange = moment(activity.date).year() + '-' + moment(activity.date).isoWeek();
        break;
      case timeRanges.Month:
        timeRange = moment(activity.date).year() + '-' + moment(activity.date).month();
        break;
      case timeRanges.Year:
        timeRange = moment(activity.date).year();
        break;
    }

    // check if the cluster already exists
    if (typeof acc[timeRange] === 'undefined') {
      acc[timeRange] = new ActivityClusterModel();
    }

    summarizeRunTypes(activity, acc[timeRange]);
    return acc;

  }, {});
}

function extractClusters(state): void {
  let names: string[] = [];
  state.activityList.forEach(item => {
    item.categorization.cluster_anchors.map(cluster => {
      if (names.indexOf(cluster.clusterName) === - 1) {
        state.existingClusters.push(cluster);
      }
      names.push(cluster.clusterName);
    });
  });
}

function sortCluster(activities, cluster) {
  let allAct = [];
  let temp = new ClusterWrapper();

  activities.forEach(activity => {
    activity.categorization.cluster_anchors.forEach(anchor => {
      if (anchor.clusterName === cluster) {
        allAct.push(activity);
        temp.stats.distance += activity.base_data.distance;
        temp.stats.time += activity.base_data.duration;
        temp.stats.intensity += activity.base_data.intensity;
        temp.stats.count++;
        switch (activity.categorization.activity_type) {
          case RunType.Run:
            temp.stats.typeCount.run.amount += 1;
            temp.stats.typeCount.run.distance += activity.base_data.distance;
            temp.stats.typeCount.run.duration += activity.base_data.duration;
            temp.stats.typeCount.run.intensity += activity.base_data.intensity;
            temp.stats.typeCount.run.type = RunType.Run;
            temp.stats.typeCount.run.activities.push(activity.id);
            break;
          case RunType.Competition:
            temp.stats.typeCount.competition.amount += 1;
            temp.stats.typeCount.competition.distance += activity.base_data.distance;
            temp.stats.typeCount.competition.duration += activity.base_data.duration;
            temp.stats.typeCount.competition.intensity += activity.base_data.intensity;
            temp.stats.typeCount.competition.type = RunType.Competition;
            temp.stats.typeCount.competition.activities.push(activity.id);
            break;
          case RunType.LongRun:
            temp.stats.typeCount.longRun.amount += 1;
            temp.stats.typeCount.longRun.distance += activity.base_data.distance;
            temp.stats.typeCount.longRun.duration += activity.base_data.duration;
            temp.stats.typeCount.longRun.intensity += activity.base_data.intensity;
            temp.stats.typeCount.longRun.type = RunType.LongRun;
            temp.stats.typeCount.longRun.activities.push(activity.id);
            break;
          case RunType.ShortIntervals:
            temp.stats.typeCount.interval.amount += 1;
            temp.stats.typeCount.interval.distance += activity.base_data.distance;
            temp.stats.typeCount.interval.duration += activity.base_data.duration;
            temp.stats.typeCount.interval.intensity += activity.base_data.intensity;
            temp.stats.typeCount.interval.type = RunType.ShortIntervals;
            temp.stats.typeCount.interval.activities.push(activity.id);
            break;
          default:
            temp.stats.typeCount.uncategorized.amount += 1;
            temp.stats.typeCount.uncategorized.distance += activity.base_data.distance;
            temp.stats.typeCount.uncategorized.duration += activity.base_data.duration;
            temp.stats.typeCount.uncategorized.intensity += activity.base_data.intensity;
            temp.stats.typeCount.uncategorized.type = RunType.Uncategorized;
            temp.stats.typeCount.uncategorized.activities.push(activity.id);
        }
      }
    });
  });


  temp.unsorted = sortActivities(allAct, timeRanges.All);

  temp.byYears = sortActivities(allAct, timeRanges.Year);

  temp.byMonths = sortActivities(allAct, timeRanges.Month);

  temp.byWeeks = sortActivities(allAct, timeRanges.Week);

  return temp;
}

function summarizeRunTypes(activity: ActivityModel, array: ActivityClusterModel) {
  array.activities.push(activity.id);
  array.rangeDate = new Date(activity.date);
  array.stats.count++;
  array.stats.distance += activity.base_data.distance;
  array.stats.time += activity.base_data.duration;
  array.stats.intensity += activity.base_data.intensity;

  switch (activity.categorization.activity_type) {
    case RunType.Run:
      array.stats.typeCount.run.amount += 1;
      array.stats.typeCount.run.distance += activity.base_data.distance;
      array.stats.typeCount.run.duration += activity.base_data.duration;
      array.stats.typeCount.run.intensity += activity.base_data.intensity;
      array.stats.typeCount.run.type = RunType.Run;
      array.stats.typeCount.run.activities.push(activity.id);
      break;
    case RunType.Competition:
      array.stats.typeCount.competition.amount += 1;
      array.stats.typeCount.competition.distance += activity.base_data.distance;
      array.stats.typeCount.competition.duration += activity.base_data.duration;
      array.stats.typeCount.competition.intensity += activity.base_data.intensity;
      array.stats.typeCount.competition.type = RunType.Competition;
      array.stats.typeCount.competition.activities.push(activity.id);
      break;
    case RunType.LongRun:
      array.stats.typeCount.longRun.amount += 1;
      array.stats.typeCount.longRun.distance += activity.base_data.distance;
      array.stats.typeCount.longRun.duration += activity.base_data.duration;
      array.stats.typeCount.longRun.intensity += activity.base_data.intensity;
      array.stats.typeCount.longRun.type = RunType.LongRun;
      array.stats.typeCount.longRun.activities.push(activity.id);
      break;
    case RunType.ShortIntervals:
      array.stats.typeCount.interval.amount += 1;
      array.stats.typeCount.interval.distance += activity.base_data.distance;
      array.stats.typeCount.interval.duration += activity.base_data.duration;
      array.stats.typeCount.interval.intensity += activity.base_data.intensity;
      array.stats.typeCount.interval.type = RunType.ShortIntervals;
      array.stats.typeCount.interval.activities.push(activity.id);
      break;
    default:
      array.stats.typeCount.uncategorized.amount += 1;
      array.stats.typeCount.uncategorized.distance += activity.base_data.distance;
      array.stats.typeCount.uncategorized.duration += activity.base_data.duration;
      array.stats.typeCount.uncategorized.intensity += activity.base_data.intensity;
      array.stats.typeCount.uncategorized.type = RunType.Uncategorized;
      array.stats.typeCount.uncategorized.activities.push(activity.id);
  }
}

const mutations: MutationTree<State> = {
  [MutationTypes.GET_ATHLETE]: (state: State, {items}) => {
    state.user = applyUserModel(items);
    state.appLoadingStatus.athlete = loadingStatus.Loaded;
  },

  [MutationTypes.GET_ACTIVITIES]: (state: State, {items}) => {
    if (!state.activityList.length) {
      let oldestDate = null;
      items.reverse().forEach((item, i) => {
        if (item.type === 'Run') {
          if (oldestDate === null) {
            oldestDate = item.start_date;
            state.filter.timeRange.start = new Date(oldestDate);
          }
          state.activityList.unshift({
            ...applyActivityModelStructure(item, oldestDate)
          });
        }
      });

      extractClusters(state);

      state.existingClusters.forEach(item => {
        if (item.isIndividual) {
          state.sortedLists[item.clusterName] = sortCluster(state.activityList, item.clusterName);
        } else {
          state.sortedLists[item.clusterName] = sortCluster(state.activityList, item.clusterName);
        }
      });
    }

    state.appLoadingStatus.activities = loadingStatus.Loaded;
  },

  [MutationTypes.GET_ACTIVITIES_FROM_JSON]: (state: State, {items}) => {
    state.activityList = items;

    state.activityList.map(activity => {
      let temp = new Date(activity.date);

      if (temp <= new Date(2018, 10, 28) && temp >= new Date(2018, 4, 7)) {
        let range = {
          start: new Date(2018, 4, 7),
          end: new Date(2018, 9, 28),
        };
        activity.categorization.cluster_anchors.push(new ClusterItem('Frankfurt-2018', ('Frankfurt-2018-' + range.start + '-' + range.end).replace(/\s+/g, ''), true, range, ClusterTypes.Marathon, 1187823373));
      }

      if (temp <= new Date(2016, 8, 10) && temp >= new Date(2016, 6, 17)) {
        let range = {
          start: new Date(2016, 6, 17),
          end: new Date(2016, 8, 10),
        };
        activity.categorization.cluster_anchors.push(new ClusterItem('Fulda-2016', ('Fulda-2016-' + range.start + '-' + range.end).replace(/\s+/g, ''), true, range, ClusterTypes.Halfmarathon, 708383513));
      }

      if (temp <= new Date(2017, 8, 19) && temp >= new Date(2017, 4, 19)) {
        let range = {
          start: new Date(2017, 4, 19),
          end: new Date(2017, 8, 20),
        };
        activity.categorization.cluster_anchors.push(new ClusterItem('Karlsruhe-2017', ('Karlsruhe-2017-' + range.start + '-' + range.end).replace(/\s+/g, ''), true, range, ClusterTypes.Halfmarathon, 1187823373));
      }

      if (temp <= new Date(2018, 1, 11) && temp >= new Date(2017, 10, 11)) {
        let range = {
          start: new Date(2017, 10, 11),
          end: new Date(2018, 1, 12),
        };
        activity.categorization.cluster_anchors.push(new ClusterItem('Barcelona-2018', ('Barcelona-2018-' + range.start + '-' + range.end).replace(/\s+/g, ''), true, range, ClusterTypes.Halfmarathon, 1401989504));
      }

      if (temp <= new Date(2017, 2, 12) && temp >= new Date(2016, 9, 12)) {
        let range = {
          start: new Date(2016, 9, 12),
          end: new Date(2017, 2, 13),
        };
        activity.categorization.cluster_anchors.push(new ClusterItem('Kandel-2017', ('Kandel-2017-' + range.start + '-' + range.end).replace(/\s+/g, ''), true, range, ClusterTypes.Halfmarathon, 897076217));
      }

      if (temp <= new Date(2018, 3, 9) && temp >= new Date(2017, 10, 8)) {
        let range = {
          start: new Date(2017, 10, 8),
          end: new Date(2018, 3, 9),
        };
        activity.categorization.cluster_anchors.push(new ClusterItem('Hannover-2018', ('Hannover-2018-' + range.start + '-' + range.end).replace(/\s+/g, ''), true, range, ClusterTypes.Marathon, 1496287411));
      }
    });

    extractClusters(state);

    state.existingClusters.forEach(item => {
      if (item.isIndividual) {
        state.sortedLists[item.clusterName] = sortCluster(state.activityList, item.clusterName);
      } else {
        state.sortedLists[item.clusterName] = sortCluster(state.activityList, item.clusterName);
      }
    });
    state.appLoadingStatus.activities = loadingStatus.Loaded;
  },

  [MutationTypes.GET_ACTIVITY]: (state: State, {item}) => {
    if (state.activityList.length !== 0) {
      state.activityList.forEach((activity, i) => {
        if (activity.id === item.id ) {
          state.activityList[i].details = applyActivityDetailModelStructure(item);
        }
      });
    }
  },

  [MutationTypes.GET_ACTIVITY_STREAMS]: (state: State, {item}) => {
    state.activityList.forEach((activity, i) => {
      if (activity.id === state.selectedActivityId) {
        state.activityList[i].streams = applyActivityStreamModelStructure(item);
      }
    });
  },

  [MutationTypes.GET_ACTIVITY_ZONES]: (state: State, {item}) => {
    state.activityList.forEach((activity, i) => {
      if (activity.id === state.selectedActivityId) {
        state.activityList[i].zones = applyActivityZoneModelStructure(item);
      }
    });
  },

  [MutationTypes.SET_SELECTED_ACTIVITY]: (state: State, {activityId}) => {
    state.selectedActivityId = activityId;
  },

  [MutationTypes.SET_SELECTED_RUNTYPE]: (state: State, {runType}) => {
    state.filter.selectedRunType = runType;
  },

  [MutationTypes.SET_SELECTED_DISPLAYTYPE]: (state: State, {type}) => {
    state.filter.selectedDisplayType = type;
  },

  [MutationTypes.SET_SHOW_EVERYTHING]: (state: State) => {
    state.filter.showEverything = !state.filter.showEverything;
  },

  [MutationTypes.SET_SELECTED_CLUSTER]: (state: State, {clusterType}) => {
    state.filter.selectedCluster = clusterType;
  },

  [MutationTypes.SET_FILTERBY_TYPE]: (state: State, {filterBy}) => {
    state.filter.selectedTrainingCluster = filterBy;
    state.existingClusters.map(cluster => {
      if (cluster.clusterName === filterBy) {
        state.filter.timeRange.end = cluster.timeRange.end;
        state.filter.timeRange.start = cluster.timeRange.start;
        if (filterBy !== 'All') {
          state.filter.timeRange.isRange = true;
        } else {
          state.filter.timeRange.isRange = false;
        }
      }
    });
  },

  [MutationTypes.SET_LOADING_STATUS]: (state: State, {loadingStatus}) => {
    state.appLoadingStatus.activities = loadingStatus;
  },

  [MutationTypes.SET_ATHLETE_LOADING_STATUS]: (state: State, {loadingStatus}) => {
    state.appLoadingStatus.athlete = loadingStatus;
  },

  [MutationTypes.SET_TIME_RANGE]: (state: State, {timeRange}) => {
    // state.filter.showEverything = false;
    let range = new TimeRangeModel();
    range.rangeType = timeRange.rangeType;
    if (timeRange.range) {
      range.start = timeRange.range.start;
      range.end = timeRange.range.end;
    }
    state.filter.timeRange = range;
  },

  [MutationTypes.SET_DISTANCE_RANGE]: (state: State, {distanceRange}) => {
    let range = new DistanceRangeModel();
    range.rangeType = distanceRange.rangeType;
    switch (range.rangeType) {
      case DistanceRangeType.g10:
        range.start = 10000;
        range.end = 1000000000000;
        break;
      case DistanceRangeType.g25:
        range.start = 25000;
        range.end = 1000000000000;
        break;
      case DistanceRangeType.None:
        range.start = 0;
        range.end = 1000000000000;
        break;
      case DistanceRangeType.Individual:
        range.start = distanceRange.range.start;
        range.end = distanceRange.range.start.end;
        break;
    }

    state.filter.distanceRange = range;
  },

  [MutationTypes.REMOVE_SELECTED_TRAINING_CLUSTER]: (state: State, {cluster}) => {
    state.compare.selectedTrainingClusters = state.compare.selectedTrainingClusters.filter(item => item !== cluster);
  },

  [MutationTypes.ADD_SELECTED_TRAINING_CLUSTER]: (state: State, {cluster}) => {
    if (state.compare.selectedTrainingClusters.indexOf(cluster) === -1 && state.compare.selectedTrainingClusters.length < 2) {
      state.compare.selectedTrainingClusters.push(cluster);
    } else if (state.compare.selectedTrainingClusters.indexOf(cluster) === -1 && state.compare.selectedTrainingClusters.length === 2) {
      state.compare.selectedTrainingClusters.splice(0, 1);
      state.compare.selectedTrainingClusters.push(cluster);
    } else {
      state.compare.selectedTrainingClusters = state.compare.selectedTrainingClusters.filter(item => item !== cluster);
    }
  },

  [MutationTypes.TOGGLE_HISTORY_CHART_DISPLAY_MODE]: (state: State) => {
    state.compare.showAbsolute = !state.compare.showAbsolute;
  },

  [MutationTypes.SET_DASHBOARD_VIEWTYPE]: (state: State, {payload}) => {
    console.log('mutations', payload);
    state.dashboardViewType = payload;
  }

};

export default mutations;
