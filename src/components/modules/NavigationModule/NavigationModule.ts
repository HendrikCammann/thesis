import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Link } from './Link';

@Component({
  template: require('./navigationModule.html'),
})
export class NavigationModule extends Vue {
  links: Link[] = [
    new Link('Dashboard', '/dashboard', 'stopwatch'),
    new Link('Wettkämpfe', '/activities', 'trophy'),
    new Link('Leistung', '/performance', 'stopwatch'),
    new Link('Vergleich', '/compare', 'compare'),
    new Link('Einheiten', '/activities', 'run-shoe'),
  ];

  @Watch('$route.path')
  pathChanged() {
    console.info('Changed current path to: ' + this.$route.path);
  }

  private handleNavigation(link): void {
    this.$router.push({
      path: link
    });
  }

  mounted() {
  }
}
