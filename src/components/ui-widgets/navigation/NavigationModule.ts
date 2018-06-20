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
    new Link('Dashboard', '/dashboard', 'dashboard--lightgray'),
    new Link('Vorbereitungen', '/compare', 'compare--lightgray'),
    new Link('Leistungsentwicklung', '/performance', 'flash--lightgray'),
    new Link('Kalender', '/activities', 'calendar--lightgray'),
    new Link('Aktivitäten', '/feed', 'running--lightgray'),
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
