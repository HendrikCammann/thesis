import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Link } from './Link';
import {eventBus} from '../../../main';
import {menuEvents} from '../../../events/Menu/menu';

@Component({
  template: require('./navigationModule.html'),
})
export class NavigationModule extends Vue {
  links: Link[] = [
    new Link('Dashboard', '/dashboard', 'dashboard'),
    new Link('Vorbereitungen', '/compare', 'compare'),
    new Link('Leistungsentwicklung', '/performance', 'intensity'),
    new Link('Trainingsentwicklung', '/activities', 'calendar'),
    new Link('Aktivitäten', '/feed', 'run'),
  ];

  @Watch('$route.path')
  pathChanged() {
    // console.info('Changed current path to: ' + this.$route.path);
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

  public navigateBack() {
    this.$router.push({
      path: this.$store.state.route.from.fullPath
    });
  }

  public state: string = '';

  mounted() {
    eventBus.$on(menuEvents.set_State, (name) => {
      this.state = name;
    });
  }
}
