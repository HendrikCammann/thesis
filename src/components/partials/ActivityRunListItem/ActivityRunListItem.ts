import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {DisplayType} from '../../../store/state';
import {getPercentageFromValue} from '../../../utils/numbers/numbers';

@Component({
  template: require('./activityRunListItem.html'),
})
export class ActivityRunListItem extends Vue {
  @Prop()
  data: any;

  @Prop()
  max: any;

  @Prop()
  index: number;

  @Prop()
  selectedType: DisplayType;

  get barLength() {
    switch (this.selectedType) {
      case DisplayType.Distance:
        return getPercentageFromValue(this.data.distanceNorm, this.max.distance);

      case DisplayType.Pace:
        return getPercentageFromValue(this.data.paceNorm, this.max.paceNorm);

      case DisplayType.Heartrate:
        return getPercentageFromValue(this.data.heartrate, this.max.heartrate);

    }
  }

  get barColor() {
    switch (this.selectedType) {
      case DisplayType.Distance:
        return '#404B54';
      case DisplayType.Pace:
        return 'blue';
      case DisplayType.Heartrate:
        return 'red';
    }
  }

  mounted() {
  }
}
