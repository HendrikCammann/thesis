/* tslint:disable */
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';
import {MutationTypes} from '../../../store/mutation-types';
import {TitleBox} from '../../partials/TitleBox';
import {ClusterItem} from '../../../models/State/StateModel';
import {compareEvents} from '../../../events/Compare/compare';
import {eventBus} from '../../../main';

@Component({
  template: require('./cardModule.html'),
})
export class CardModule extends Vue {
  @Prop()
  headline: string;

  @Prop()
  useHeadline: boolean;

  @Prop()
  useOuterLables: boolean;
}
