import {GetterTree} from 'vuex';
import {State} from './state';
import {getKeys} from '../utils/array-helper';
import {ActivityModel} from '../models/Activity/ActivityModel';

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

  // ACTIVITIES
  getActivitiesFromLastTwoWeeks: (state) => {
    let keys = getKeys(state.sortedLists['All'].byWeeks);
    return [state.sortedLists['All'].byWeeks[keys[0]], state.sortedLists['All'].byWeeks[keys[1]]];
  },

  getLatestActivity: (state) => {
    return state.activityList[0];
  },

  getActualWeekActivities: (state) => {
    let keys = getKeys(state.sortedLists['All'].byWeeks);
    if (keys.length !== 0) {
      let arr = [];
      state.sortedLists['All'].byWeeks[keys[0]].activities.forEach(id => {
        arr.push(state.activityList.find(item => item.id === id));
      });

      arr.sort((a, b) => {
        return +new Date(a.date) - +new Date(b.date);
      });

      let returnArr = [new ActivityModel(), new ActivityModel(), new ActivityModel(), new ActivityModel(), new ActivityModel(), new ActivityModel(), new ActivityModel()];

      arr.forEach(item => {
        if (new Date(item.date).getDay() === 0) {
          returnArr[6] = item;
        } else {
          returnArr[new Date(item.date).getDay() - 1] = item;
        }
      });
      return returnArr;
    }
  },


  // CLUSTERS
  getClusters: (state) => {
    return state.existingClusters;
  },

  getExistingClusters: (state) => {
    return state.existingClusters;
  },


  // COMPARE
  getSelectedTrainingClusters: (state) => {
    return state.compare.selectedTrainingClusters;
  },

  getShowAbsolute: (state) => {
    return state.compare.showAbsolute;
  },

  getShownBars: (state) => {
    return state.compare.shownBars;
  },

  getTimeRanges: (state) => {
    return state.compare.timeRanges;
  },


  // EXISTING CLUSTERS
  getCluster: (state) => {
    return (cluster) => {
      return state.existingClusters.find(item => item.clusterName === cluster);
    };
  },


  // ACTIVITIES
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

  getSelectedActivityZones: (state) => {
    for (let i = 0; i < state.activityList.length; i++) {
      if (state.selectedActivityId === state.activityList[i].id && state.activityList[i].zones !== null) {
        return state.activityList[i].zones;
      }
    }
  },


  // FILTER
  getTimeRange: (state) => {
    return state.filter.timeRange;
  },

  getSelectedRunType: (state) => {
    return state.filter.selectedRunType;
  },

  getShowEverything: (state) => {
    return state.filter.showEverything;
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
