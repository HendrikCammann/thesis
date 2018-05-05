/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {ActivityModel} from '../../../models/Activity/ActivityModel';
import {setupSvg} from '../../../utils/svgInit/svgInit';
import {PositionModel} from '../../../models/Chart/ChartModels';
import {getLargerValue} from '../../../utils/numbers/numbers';

@Component({
  template: require('./barChart.html'),
})
export class BarChart extends Vue {
  @Prop()
  root: string;

  @Prop()
  activity: ActivityModel | any;

  private extractLapsFromActivity(activity) {
    return {
      laps: activity.details.laps,
      zones: activity.zones,
      streams: activity.streams,
      base_data: activity.base_data,
    }
  }



  private barChart(root: string, canvasConstraints, activity: ActivityModel) {
    let svg = setupSvg(root, canvasConstraints.width, canvasConstraints.height);
    console.log(activity);
    let data = this.extractLapsFromActivity(activity);
    let offset = 5;

    let startPos: PositionModel = {
      x: 10,
      y: canvasConstraints.height / 2,
    };

    console.log(data.zones);

    let paceZoneMax = 0;
    let heartrateZoneMax = 0;

    for (let key in data.zones) {
      for (let i = 0; i < data.zones[key].distribution_buckets.length; i++) {
        if (key === 'pace') {
          paceZoneMax = getLargerValue(data.zones[key].distribution_buckets[i].max, paceZoneMax);
        } else {
          heartrateZoneMax = getLargerValue(data.zones[key].distribution_buckets[i].max, heartrateZoneMax);
        }
      }
    }

    console.log('pace', paceZoneMax);
    console.log('hr', heartrateZoneMax);

    data.laps.map(lap => {
      let width = this.calculateWidth(lap.distance);
      let paceHeight = this.calculateHeight(lap.average_speed, paceZoneMax, 150);
      let hrHeight = this.calculateHeight(lap.average_heartrate, heartrateZoneMax, 150);

      svg.append('rect')
        .attr('x', startPos.x)
        .attr('y', startPos.y - paceHeight)
        .attr('width', width)
        .attr('height', paceHeight)
        .attr('opacity', 0.7)
        .attr('fill', '#43b3e6');

      svg.append('rect')
        .attr('x', startPos.x)
        .attr('y', startPos.y)
        .attr('width', width)
        .attr('height', hrHeight)
        .attr('opacity', 0.7)
        .attr('fill', '#ec407a');

      startPos.x += (width + offset);
    });

    svg.append('rect')
      .attr('x', 0)
      .attr('y', startPos.y)
      .attr('width', startPos.x  + 10)
      .attr('height', 1)
      .attr('fill', '#E6E6E6');
  }

  private calculateHeight(value, indexValue, indexHeight) {
    let percentage = (100 / indexValue * value) / 100;
    return indexHeight * percentage;
  }

  private calculateHrHeight(hr) {
    return hr * 1;
  }

  private calculatePaceHeight(speed) {
    return speed * 20;
  }

  private calculateWidth(distance) {
    let widthPerKm = 30;
    let factor = distance / 1000;
    return widthPerKm * factor;
  }

  mounted() {
    this.barChart('#' + this.root, {width: 1200, height: 400, marginBottom: 20, canvasOffset: 10}, this.activity);
  }
}
