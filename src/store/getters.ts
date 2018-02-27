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
  getSelectedActivityDetails: (state) => {
    for (let i = 0; i < state.activityList.length; i++) {
      if (state.selectedActivityId === state.activityList[i].id) {
        return state.activityList[i].details;
      }
    }
  }
};

export default getters;
