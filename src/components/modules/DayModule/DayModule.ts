/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {TitleBox} from '../../partials/TitleBox';

@Component({
  template: require('./dayModule.html'),
  components: {
    'titleBox': TitleBox,
  }
})
export class DayModule extends Vue {
  @Prop()
  date: Date;

  @Watch('user')
  onPropertyChanged(val: any, oldVal: any) {

  }

  public dayPosFix(day): string {
    switch(day) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  public get formatedDate(): string {
    let dayName = this.date.toLocaleDateString('en-EN', { weekday: 'short' });
    let month = this.date.toLocaleDateString('en-DE', { month: 'long'});
    let day = this.date.toLocaleDateString('en-DE', { day: 'numeric'});
    day += this.dayPosFix(day);
    return dayName + ' | ' + month + ' ' + ' ' + day;
  }

}
