/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';

@Component({
  template: require('./dimension.html'),
})
export class Dimension extends Vue {

  private hidePermantly = false;

  public hidePopup() {
    this.hidePermantly = true;
  }

  mounted() {
  }
}
