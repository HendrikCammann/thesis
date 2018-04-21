import {GetterTree} from 'vuex';
import {State} from './state';

// State , RootState
const getters: GetterTree<State, State> = {
  getAppLoadingStatus: (state) => {
    return state.appLoadingStatus;
  },

  getAthlete: (state) => {
    return state.user;
  },

  getActivityListLength: (state) => {
    if (state.activityList !== undefined) {
      return state.activityList.length;
    }
  },
  getActivities: (state) => {
    return state.activityList;
  },
  getSortedActivities: (state) => {
      return state.acitvitySortedLists;
  },
  getActivity: (state, getters) =>  {
    return (id) => {
      return state.activityList.find(item => item.id === id);
    };
  },
  getSelectedActivityId: (state) => {
      return state.selectedActivityId;
  },
  getSelectedActivity: (state) => {
    for (let i = 0; i < state.activityList.length; i++) {
      if (state.selectedActivityId === state.activityList[i].id) {
        return state.activityList[i];
      }
    }
  },
  getSelectedActivityStreams: (state) => {
    for (let i = 0; i < state.activityList.length; i++) {
      if (state.selectedActivityId === state.activityList[i].id && state.activityList[i].streams !== null) {
        return state.activityList[i].streams;
      }
    }
  },

  getSelectedRunType: (state) => {
    return state.filter.selectedRunType;
  },

  getSelectedClusterType: (state) => {
    return state.filter.selectedCluster;
  },

  getFilter: (state) => {
    return state.filter;
  },
};

export default getters;
