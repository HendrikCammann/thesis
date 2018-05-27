import Vue from 'vue';
import VueRouter from 'vue-router';

// containers
import { AppContainer } from '../components/containers/App/';
import { ActivitiesContainer } from '../components/containers/Activities';
import { ActivityContainer } from '../components/containers/Activity';
import {Dashboard} from '../components/containers/Dashboard';
import {CompareContainer} from '../components/containers/Compare';
import {ComparisonContainer} from '../components/containers/Comparison';

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
      component: ComparisonContainer,
      name: 'Vergleich',
      path: '/comparison',
    }, {
      component: ActivityContainer,
      name: 'Activity',
      path: '/activity/:id',
    }, {
      component: ActivitiesContainer,
      name: 'Leistung',
      path: '/performance',
    }, {
      component: CompareContainer,
      name: 'Test',
      path: '/compare',
    }, {
      component: ActivitiesContainer,
      name: 'Einheiten',
      path: '/activities',
    }
  ],
});

export default router;
