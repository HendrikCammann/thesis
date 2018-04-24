import {ActionTree} from 'vuex';
import {MutationTypes} from './mutation-types';
import {State} from './state';
import * as listAPI from '../api/listItems';
import * as stravaAPI from '../api/stravaAPI';
import {loadingStatus} from '../models/App/AppStatus';

let token = '386bced857a83a6a4575b2308a3de25b95fa9116';
let page = 1;
let per_page = 200;
let streams = ['cadence', 'altitude', 'velocity_smooth', 'heartrate'];

const actions: ActionTree<State, State> = {
  [MutationTypes.INCREMENT_VALUE]: ({commit}) => {
    commit(MutationTypes.INCREMENT_VALUE);
  },

  [MutationTypes.DECREMENT_VALUE]: ({commit}) => {
    commit(MutationTypes.DECREMENT_VALUE);
  },

  [MutationTypes.RESET_VALUE]: ({commit}) => {
    commit(MutationTypes.RESET_VALUE);
  },

  [MutationTypes.GET_LIST]: ({commit}) => {
    listAPI.getAllList(items => {
      commit(MutationTypes.GET_LIST, {
        items
      });
    });
  },

  [MutationTypes.GET_ATHLETE]: ({commit}) => {
    stravaAPI.getAthlete(16363367, token, (items) => {
      commit(MutationTypes.GET_ATHLETE, {
        items
      });
    });
  },

  [MutationTypes.GET_ACTIVITIES]: ({commit}) => {
    /*if (localStorage.getItem('activities') === null) {*/
      stravaAPI.getActivityPages(page, per_page, token, (items) => {
        commit(MutationTypes.GET_ACTIVITIES, {
          items
        });
      });
    /*} else {
      commit(MutationTypes.SET_ACTIVITIES_FROM_LOCALSTORAGE, {
        items: localStorage.getItem('activities')
      });
    }*/
  },

  [MutationTypes.GET_ACTIVITY]: ({commit}, activityId) => {
    stravaAPI.getActivity(activityId, token, (item) => {
      commit(MutationTypes.GET_ACTIVITY, {
        item
      });
    });
  },

  [MutationTypes.GET_ACTIVITY_STREAMS]: ({commit}, activityId) => {
    stravaAPI.getStreamsForActivity(activityId, streams, token, (item) => {
      commit(MutationTypes.GET_ACTIVITY_STREAMS, {
        item
      });
    });
  },

  [MutationTypes.GET_ACTIVITY_ZONES]: ({commit}, activityId) => {
    stravaAPI.getZonesForActivity(activityId, token, (item) => {
      commit(MutationTypes.GET_ACTIVITY_ZONES, {
        item
      });
    });
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

};

export default actions;
