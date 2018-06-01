import {Component, Prop, Watch} from 'vue-property-decorator';
import Vue from 'vue';

@Component({
  template: require('./headlineBox.html'),
})
export class HeadlineBox extends Vue {
  @Prop()
  public headline: string;

  @Prop()
  public label: string;

  @Prop()
  public image: string;

  get imagePath() {
    return require('../../../assets/icons/' + this.image + '.svg');
  }
}
