import Vue from 'vue';
import VueRouter from 'vue-router';

// containers
import { AppContainer } from '../components/containers/App/';
import { ActivitiesContainer } from '../components/containers/Activities';
import { ActivityContainer } from '../components/containers/Activity';
import {Dashboard} from '../components/containers/Dashboard';

// register the plugin
Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      component: AppContainer,
      name: 'index',
      path: '/',
    }, {
      component: Dashboard,
      name: 'dashboard',
      path: '/dashboard',
    }, {
      component: ActivitiesContainer,
      name: 'activities',
      path: '/activities',
    }, {
      component: ActivityContainer,
      name: 'activity',
      path: '/activity/:id',
    }, {
      component: ActivitiesContainer,
      name: 'performance',
      path: '/performance',
    }
  ],
});

export default router;
