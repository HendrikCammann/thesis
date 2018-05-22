import {ActionTree} from 'vuex';
import {MutationTypes} from './mutation-types';
import {State} from './state';

import * as stravaAPI from '../api/stravaAPI';
import {reformatJSON} from '../utils/localData/formatJSON';
const config = require('../_config/config.json');
const stravaData = require('../stravadatabase/18_05_22_16_33.json');

let token = '386bced857a83a6a4575b2308a3de25b95fa9116';
let page = 1;
let per_page = 200;
let streams = ['cadence', 'altitude', 'velocity_smooth', 'heartrate'];

const actions: ActionTree<State, State> = {
  [MutationTypes.GET_ATHLETE]: ({commit}) => {
    stravaAPI.getAthlete(16363367, token, (items) => {
      commit(MutationTypes.GET_ATHLETE, {
        items
      });
    });
  },

  [MutationTypes.GET_ACTIVITIES]: ({commit}) => {
    if (config.useStravaApi) {
      stravaAPI.getActivityPages(page, per_page, token, (items) => {
        commit(MutationTypes.GET_ACTIVITIES, {
          items
        });
      });
    } else {
      commit(MutationTypes.GET_ACTIVITIES_FROM_JSON, {
        items: reformatJSON(stravaData)
      });
    }
  },

  [MutationTypes.GET_ACTIVITY]: ({commit}, activityId) => {
    if (config.useStravaApi) {
      stravaAPI.getActivity(activityId, token, (item) => {
        commit(MutationTypes.GET_ACTIVITY, {
          item
        });
      });
    }
  },

  [MutationTypes.GET_ACTIVITY_STREAMS]: ({commit}, activityId) => {
    if (config.useStravaApi) {
      stravaAPI.getStreamsForActivity(activityId, streams, token, (item) => {
        commit(MutationTypes.GET_ACTIVITY_STREAMS, {
          item
        });
      });
    }
  },

  [MutationTypes.GET_ACTIVITY_ZONES]: ({commit}, activityId) => {
    if (config.useStravaApi) {
      stravaAPI.getZonesForActivity(activityId, token, (item) => {
        commit(MutationTypes.GET_ACTIVITY_ZONES, {
          item
        });
      });
    }
  },

  [MutationTypes.SET_SELECTED_ACTIVITY]: ({commit}, activityId) => {
    commit(MutationTypes.SET_SELECTED_ACTIVITY, {
      activityId
    });
  },

  [MutationTypes.SET_SELECTED_RUNTYPE]: ({commit}, runType) => {
    commit(MutationTypes.SET_SELECTED_RUNTYPE, {
      runType
    });
  },

  [MutationTypes.SET_SHOW_EVERYTHING]: ({commit}) => {
    commit(MutationTypes.SET_SHOW_EVERYTHING, {

    });
  },

  [MutationTypes.SET_SELECTED_CLUSTER]: ({commit}, clusterType) => {
    commit(MutationTypes.SET_SELECTED_CLUSTER, {
      clusterType
    });
  },

  [MutationTypes.SET_FILTERBY_TYPE]: ({commit}, filterBy) => {
    commit(MutationTypes.SET_FILTERBY_TYPE, {
      filterBy
    });
  },

  [MutationTypes.SET_LOADING_STATUS]: ({commit}, loadingStatus) => {
    commit(MutationTypes.SET_LOADING_STATUS, {
      loadingStatus
    });
  },

  [MutationTypes.SET_ATHLETE_LOADING_STATUS]: ({commit}, loadingStatus) => {
    commit(MutationTypes.SET_ATHLETE_LOADING_STATUS, {
      loadingStatus
    });
  },

  [MutationTypes.SET_TIME_RANGE]: ({commit}, timeRange) => {
    commit(MutationTypes.SET_TIME_RANGE, {
      timeRange
    });
  },

  [MutationTypes.REMOVE_SELECTED_TRAINING_CLUSTER]: ({commit}, cluster) => {
    commit(MutationTypes.REMOVE_SELECTED_TRAINING_CLUSTER, {
      cluster
    });
  },

  [MutationTypes.ADD_SELECTED_TRAINING_CLUSTER]: ({commit}, cluster) => {
    commit(MutationTypes.ADD_SELECTED_TRAINING_CLUSTER, {
      cluster
    });
  },

  [MutationTypes.SET_SHOWN_COMPARE_ACTIVITIES]: ({commit}, shownBars) => {
    commit(MutationTypes.SET_SHOWN_COMPARE_ACTIVITIES, {
      shownBars
    });
  },

  [MutationTypes.SET_COMPARE_TIME_RANGE]: ({commit}, timeRange) => {
    commit(MutationTypes.SET_COMPARE_TIME_RANGE, {
      timeRange
    });
  },

  [MutationTypes.TOGGLE_HISTORY_CHART_DISPLAY_MODE]: ({commit}) => {
    commit(MutationTypes.TOGGLE_HISTORY_CHART_DISPLAY_MODE);
  },

  [MutationTypes.SELECT_COMPARE_WEEK]: ({commit}, {week, preparation}) => {
    commit(MutationTypes.SELECT_COMPARE_WEEK, {
      week, preparation
    });
  },

  [MutationTypes.DESELECT_COMPARE_WEEK]: ({commit}, {week, preparation}) => {
    commit(MutationTypes.DESELECT_COMPARE_WEEK, {
      week, preparation
    });
  },

};

export default actions;
