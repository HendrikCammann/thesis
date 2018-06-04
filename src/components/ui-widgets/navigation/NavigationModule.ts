import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Link } from './Link';

@Component({
  template: require('./navigationModule.html'),
})
export class NavigationModule extends Vue {
  links: Link[] = [
    new Link('Dashboard', '/dashboard', 'stopwatch'),
    new Link('Vergleich', '/compare', 'compare'),
    new Link('Leistung', '/performance', 'bottle'),
    new Link('Einheiten', '/activities', 'run-shoe'),
  ];

  @Watch('$route.path')
  pathChanged() {
    console.info('Changed current path to: ' + this.$route.path);
  }

  public menuOpen = false;

  private handleNavigation(link): void {
    this.$router.push({
      path: link
    });
    this.closeMenu();
  }

  public closeMenu() {
    this.menuOpen = false;
  }

  public openMenu() {
    this.menuOpen = true;
  }

  mounted() {
  }
}
