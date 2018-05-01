import {GetterTree} from 'vuex';
import {State} from './state';
import {getKeys} from '../utils/array-helper';

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
  getSortedLists: (state) => {
    return state.sortedLists;
  },
  getClusters: (state) => {
    return state.existingClusters;
  },
  getExistingClusters: (state) => {
    return state.existingClusters;
  },

  getSelectedTrainingClusters: (state) => {
    return state.compare.selectedTrainingClusters;
  },

  getCluster: (state) => {
    return (cluster) => {
      return state.existingClusters.find(item => item.clusterName === cluster);
    };
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
  getTimeRange: (state) => {
    return state.filter.timeRange;
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

  getDashboardFilter: (state) => {
    return state.dashboardFilter;
  },
};

export default getters;
