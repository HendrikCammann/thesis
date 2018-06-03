/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {ContentBoxModel} from '../../../models/ui-elements/content-box/ContentBoxModel';
import {eventBus} from '../../../main';
import {compareEvents} from '../../../events/Compare/compare';

@Component({
  template: require('./contentBox.html'),
})
export class ContentBox extends Vue {
  @Prop()
  data: ContentBoxModel;

  @Prop()
  isClickable: boolean;

  private handleClick() {
    if(this.isClickable) {
      eventBus.$emit(compareEvents.add_Training_Cluster, this.data.value);
    }
  }

  private get iconColor() {
    if (this.data.isActive) {
      return '--active';
    } else {
      return '--gray'
    }
  }

  mounted() {
  }
}
