import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Link } from './Link';

@Component({
  template: require('./navbar.html'),
})
export class Navbar extends Vue {
  links: Link[] = [
    new Link('Dashboard', '/dashboard'),
    new Link('Trainingshistorie', '/activities'),
    new Link('Leistungsentwicklung', '/performance')
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
