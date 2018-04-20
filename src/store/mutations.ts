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
import {TimeRangeModel} from '../models/Filter/FilterModel';

enum timeRanges {
  All = 'all',
  Week = 'week',
  Month = 'month',
  Year = 'year'
}

function applyActivityModelStructure(item): ActivityModel {
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

  activity.max_data.heartrate = item.max_heartrate;
  activity.max_data.speed = item.max_speed;

  activity.categorization.cluster_anchor_month = new Date(item.start_date).getFullYear() + '-' + new Date(item.start_date).getMonth();
  activity.categorization.cluster_anchor_year = new Date(item.start_date).getFullYear().toString();
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
        timeRange = 'All';
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

    acc[timeRange].activities.push(activity.id);
    acc[timeRange].rangeName = timeRange;
    acc[timeRange].rangeDate = new Date(activity.date);
    acc[timeRange].stats.distance += activity.base_data.distance;
    acc[timeRange].stats.time += activity.base_data.duration;
    acc[timeRange].stats.count++;
    switch (activity.categorization.activity_type) {
      case RunType.Run:
        acc[timeRange].stats.typeCount.run.amount += 1;
        acc[timeRange].stats.typeCount.run.distance += activity.base_data.distance;
        acc[timeRange].stats.typeCount.run.type = RunType.Run;
        acc[timeRange].stats.typeCount.run.activities.push(activity.id);
        break;
      case RunType.Competition:
        acc[timeRange].stats.typeCount.competition.amount += 1;
        acc[timeRange].stats.typeCount.competition.distance += activity.base_data.distance;
        acc[timeRange].stats.typeCount.competition.type = RunType.Competition;
        acc[timeRange].stats.typeCount.competition.activities.push(activity.id);
        break;
      case RunType.LongRun:
        acc[timeRange].stats.typeCount.longRun.amount += 1;
        acc[timeRange].stats.typeCount.longRun.distance += activity.base_data.distance;
        acc[timeRange].stats.typeCount.longRun.type = RunType.LongRun;
        acc[timeRange].stats.typeCount.longRun.activities.push(activity.id);
        break;
      case RunType.ShortIntervals:
        acc[timeRange].stats.typeCount.interval.amount += 1;
        acc[timeRange].stats.typeCount.interval.distance += activity.base_data.distance;
        acc[timeRange].stats.typeCount.interval.type = RunType.ShortIntervals;
        acc[timeRange].stats.typeCount.interval.activities.push(activity.id);
        break;
      default:
        acc[timeRange].stats.typeCount.uncategorized.amount += 1;
        acc[timeRange].stats.typeCount.uncategorized.distance += activity.base_data.distance;
        acc[timeRange].stats.typeCount.uncategorized.type = RunType.Uncategorized;
        acc[timeRange].stats.typeCount.uncategorized.activities.push(activity.id);
    }
    return acc;

  }, {});
}

const mutations: MutationTree<State> = {
  [MutationTypes.GET_RACE]: (state: State, {items}) => {
    if (!state.runningRaces.length) {
      items.forEach(item => {
        state.runningRaces.push({
          ...item
        });
      });
    }
  },

  [MutationTypes.GET_ACTIVITIES]: (state: State, {items}) => {
    if (!state.activityList.length) {
      items.forEach(item => {
        if (item.type === 'Run') {
          state.activityList.push({
            ...applyActivityModelStructure(item)
          });
        }
      });

      state.acitvitySortedLists.byWeeks = sortActivities(state.activityList, timeRanges.Week);
      state.acitvitySortedLists.byMonths = sortActivities(state.activityList, timeRanges.Month);
      state.acitvitySortedLists.byYears = sortActivities(state.activityList, timeRanges.Year);
      state.acitvitySortedLists.all = sortActivities(state.activityList, timeRanges.All);
      }
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

  [MutationTypes.SET_SELECTED_CLUSTER]: (state: State, {clusterType}) => {
    state.filter.selectedCluster = clusterType;
  },

  [MutationTypes.SET_FILTERBY_TYPE]: (state: State, {filterBy}) => {
      state.filter.timeRange.start = filterBy.start;
      state.filter.timeRange.end = filterBy.end;
      state.filter.timeRange.isRange = filterBy.isRange;
      state.filter.showEverything = false;
  }

};

export default mutations;
