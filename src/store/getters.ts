import {GetterTree} from 'vuex';
import {RunType, State} from './state';
import {getKeys} from '../utils/array-helper';
import {ActivityModel} from '../models/Activity/ActivityModel';
import {FormatDistanceType} from '../models/FormatModel';
import {formatDistance} from '../utils/format-data';

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

      let returnArr = [[], [], [], [], [], [], []];

      arr.forEach(item => {
        // console.log(item);
        if (item !== undefined) {
          if (new Date(item.date).getDay() === 0) {
            returnArr[6].push(item);
          } else {
            returnArr[new Date(item.date).getDay() - 1].push(item);
          }
        }
      });

      return returnArr;
    }
  },

  getActualMonthStats: (state) => {
    let keys = getKeys(state.sortedLists['All'].byMonths);
    let arr = [];
    if (keys.length !== 0) {
      state.sortedLists['All'].byMonths[keys[0]].activities.forEach(id => {
        arr.push(state.activityList.find(item => item.id === id));
      });
    }
    let duration = 0;
    let intensity = 0;
    let distance = 0;
    let amount = arr.length;

    arr.forEach(item => {
      duration += item.base_data.duration;
      distance += item.base_data.distance;
      intensity += 0;
    });

    return {
      duration: duration,
      intensity: intensity,
      distance: distance,
      amount: amount,
    };
  },

  getCompetitions: (state) => {
    let arr = [];
    state.activityList.filter(item => {
      if (item.categorization.activity_type === RunType.Competition) {
        arr.push(item);
      }
    });
    return arr;
  },

  // CLUSTERS
  getClusters: (state) => {
    return state.existingClusters;
  },

  getExistingClusters: (state) => {
    return state.existingClusters;
  },


  // COMPARE
  getSelectedTrainingClustersData: (state) => {
    let arr = [];
    state.existingClusters.forEach(cluster => {
      if (state.compare.selectedTrainingClusters.indexOf(cluster.clusterName) > - 1) {
        arr.push(cluster);
      }
    });
    return arr;
  },

  getSelectedTrainingClustersFull: (state) => {
    let arr = [];
    state.compare.selectedTrainingClusters.forEach(cluster => {
      arr.push({
        data: state.sortedLists[cluster],
        name: cluster,
      });
    });
    return arr;
  },

  getSelectedTrainingClusters: (state) => {
    return state.compare.selectedTrainingClusters;
  },

  getShowAbsolute: (state) => {
    return state.compare.showAbsolute;
  },


  // EXISTING CLUSTERS
  getCluster: (state) => {
    return (cluster) => {
      return state.existingClusters.find(item => item.clusterName === cluster);
    };
  },

  getCurrentPreparation: (state) => {
    return state.currentPreparation;
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
    console.log('in', state.selectedActivityId);
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

  getTimeRangeType: (state) => {
    return state.filter.timeRange.rangeType;
  },

  getDistanceRange: (state) => {
    return state.filter.distanceRange;
  },

  getDistanceRangeType: (state) => {
    return state.filter.distanceRange.rangeType;
  },

  getSelectedRunType: (state) => {
    return state.filter.selectedRunType;
  },

  getSelectedDisplayType: (state) => {
    return state.filter.selectedDisplayType;
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

  // DASHBOARD
  getDashboardViewType: (state) => {
    return state.dashboardViewType;
  },


  // PROFILE
  getNumberOfActivities: (state) => {
    return state.activityList.length;
  },

  getNumberOfCompetitions: (state) => {
    let ctn = 0;
    state.activityList.forEach(item => {
      if (item.categorization.activity_type === RunType.Competition) {
        ctn++;
      }
    });

    return ctn;
  },

  getTotalDistance: (state) => {
    let ctn = 0;
    state.activityList.forEach(item => {
      ctn += item.base_data.distance;
    });

    return Math.round(formatDistance(ctn, FormatDistanceType.Kilometers)) + 'km';
  }

};

export default getters;
