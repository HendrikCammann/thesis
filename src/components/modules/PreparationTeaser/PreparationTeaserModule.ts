import {Component, Prop, Watch} from 'vue-property-decorator';
import Vue from 'vue';
import {Button} from '../../partials/Button';

@Component({
  template: require('./preparationTeaser.html'),
  components: {
    'buttonPartial': Button,
  }
})
export class PreparationTeaserModule extends Vue {
}
