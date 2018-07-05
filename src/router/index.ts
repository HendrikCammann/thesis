import Vue from 'vue';
import VueRouter from 'vue-router';

// containers
import { AppContainer } from '../components/containers/App/';
import { ActivitiesContainer } from '../components/containers/Activities';
import { ActivityContainer } from '../components/containers/Activity';
import {Dashboard} from '../components/containers/Dashboard';
import {Compare} from '../components/containers/Compare';
import {ActivityFeed} from '../components/containers/Feed/ActivityFeed';
import {Profile} from '../components/containers/Profile';
import {Performance} from '../components/containers/Performance';
import {PerformanceSelect} from '../components/ui-widgets/performance-select/PerformanceSelect';
import {PerformanceActivities} from '../components/ui-widgets/performance-activities/PerformanceActivities';
import {PerformanceCompetition} from '../components/ui-widgets/performance-competition';
import {PerformanceDiagnostic} from '../components/ui-widgets/performance-diagnostic';
import {CompareContainer} from '../components/containers/CompareContainer';

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
      component: Performance,
      // name: 'Leistungsentwicklung',
      path: '/performance/',
      children: [
        // UserHome will be rendered inside User's <router-view>
        // when /user/:id is matched
        { path: '', name: 'Leistungsentwicklung', component: PerformanceSelect },
        { path: 'activities', name: 'Leistungsentwicklung', component: PerformanceActivities },
        { path: 'competitions', name: 'Leistungsentwicklung', component: PerformanceCompetition },
        { path: 'diagnostic', name: 'Leistungsentwicklung', component: PerformanceDiagnostic },
      ]
    }, {
      component: Compare,
      name: 'Vorbereitungen',
      path: '/compare',
      children: [
        { path: '', name: 'Vorbereitungen', component: CompareContainer},
        { path: 'result', name: 'Vorbereitungen', component: CompareContainer},
      ]
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
