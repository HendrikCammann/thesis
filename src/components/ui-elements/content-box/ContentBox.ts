/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {ContentBoxModel} from '../../../models/ui-elements/content-box/ContentBoxModel';
import {eventBus} from '../../../main';
import {compareEvents} from '../../../events/Compare/compare';
import {modalEvents} from '../../../events/Modal/modal';

@Component({
  template: require('./contentBox.html'),
})
export class ContentBox extends Vue {
  @Prop()
  data: ContentBoxModel;

  @Prop()
  isClickable: boolean;

  @Prop()
  hasInformation: boolean;

  private handleClick() {
    if(this.isClickable) {
      eventBus.$emit(compareEvents.add_Training_Cluster, this.data.value);
    }

    if(this.hasInformation) {
      eventBus.$emit(modalEvents.open_Modal, this.data.information);
    }
  }

  private get iconColor() {
    if (this.data.isActive) {
      return '--active';
    } else {
      return '--light'
    }
  }

  mounted() {
  }
}
