import Vue from 'vue';
import {MutationTree} from 'vuex';
import {MutationTypes} from './mutation-types';
import {State} from './state';
import * as _ from 'lodash';

const mutations: MutationTree<State> = {
  [MutationTypes.INCREMENT_VALUE]: (state: State) => {
    state.count += 1;
  },
  [MutationTypes.DECREMENT_VALUE]: (state: State) => {
    state.count -= 1;
  },
  [MutationTypes.RESET_VALUE]: (state: State) => {
    state.count = 0;
  },

  [MutationTypes.GET_LIST]: (state: State, {items}) => {
    if (!state.listItem.length) {
      items.forEach(items => {
        state.listItem.push({
          id: items.id,
          name: items.name,
        });
      });
    }
  },

  [MutationTypes.GET_ACTIVITIES]: (state: State, {items}) => {
    if (!state.activityList.length) {
      items.forEach(item => {
        state.activityList.push({
          ...item
        });
      });
      localStorage.setItem('activities', JSON.stringify(state.activityList));
    }
  },

  [MutationTypes.GET_ACTIVITY]: (state: State, {item}) => {
    if (state.activityList.length !== 0) {
      state.activityList.forEach((activity, i) => {
        if (activity.id === item.id ) {
          let obj = {
            details: item
          };
          // item = {...item, details: item};

          state.activityList.splice(i, 1,  _.merge(state.activityList[i], obj));
          localStorage.setItem('activities', JSON.stringify(state.activityList));
        }
      });
    }
  },

  [MutationTypes.GET_ACTIVITY_STREAMS]: (state: State, {item}) => {
    state.activityList.forEach((activity, i) => {
      if (activity.id === state.selectedActivityId) {
        let obj = {
          streams: item
        };
        state.activityList.splice(i, 1,  _.merge(state.activityList[i], obj));
      }
    });
  },

  [MutationTypes.SET_SELECTED_ACTIVITY]: (state: State, {activityId}) => {
    state.selectedActivityId = activityId;
    localStorage.setItem('selectedActivityId', state.selectedActivityId.toString());
  },

  [MutationTypes.SET_SELECTED_ACTIVITY_FROM_LOCALSTORAGE]: (state: State, {activityId}) => {
    console.log('shaidh');
  },

  [MutationTypes.SET_ACTIVITIES_FROM_LOCALSTORAGE]: (state: State, {items}) => {
    state.activityList = JSON.parse(items);
    localStorage.setItem('activities', JSON.stringify(state.activityList));
  },

};

export default mutations;
