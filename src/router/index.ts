import Vue from 'vue';
import VueRouter from 'vue-router';

// containers
import { AppContainer } from '../components/containers/App/';
import { ActivitiesContainer } from '../components/containers/Activities';
import { ActivityContainer } from '../components/containers/Activity';
import {Dashboard} from '../components/containers/Dashboard';
import {CompareContainer} from '../components/containers/Compare';
import {ActivityFeed} from '../components/containers/Feed/ActivityFeed';
import {Profile} from '../components/containers/Profile';

// register the plugin
Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      component: AppContainer,
      name: 'Index',
      path: '/',
    }, {
      component: Dashboard,
      name: 'Dashboard',
      path: '/dashboard',
    }, {
      component: ActivityContainer,
      name: 'Activity',
      path: '/activity/:id',
    }, {
      component: ActivitiesContainer,
      name: 'Leistungsentwicklung',
      path: '/performance',
    }, {
      component: CompareContainer,
      name: 'Vorbereitungen',
      path: '/compare',
    }, {
      component: ActivitiesContainer,
      name: 'Kalender',
      path: '/activities',
    }, {
      component: ActivityFeed,
      name: 'Aktivitäten',
      path: '/feed',
    }, {
      component: Profile,
      name: 'Profil',
      path: '/user',
    }
  ],
});

export default router;
