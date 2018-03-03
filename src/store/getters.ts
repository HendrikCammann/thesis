import {GetterTree} from 'vuex';
import {State} from './state';

// State , RootState
const getters: GetterTree<State, State> = {
  getActivityListLength: (state) => {
    if (state.activityList !== undefined) {
      return state.activityList.length;
    }
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
      if (state.selectedActivityId === state.activityList[i].id && state.activityList[i].streams !== undefined) {
        return state.activityList[i].streams[2];
      }
    }
  },
  getSelectedActivityStreamsDistance: (state) => {
    for (let i = 0; i < state.activityList.length; i++) {
      if (state.selectedActivityId === state.activityList[i].id && state.activityList[i].streams !== undefined) {
        return state.activityList[i].streams[0];
      }
    }
  },
  getSelectedActivityStreamsPace: (state) => {
    for (let i = 0; i < state.activityList.length; i++) {
      if (state.selectedActivityId === state.activityList[i].id && state.activityList[i].streams !== undefined) {
        return state.activityList[i].streams[4];
      }
    }
  }
};

export default getters;
