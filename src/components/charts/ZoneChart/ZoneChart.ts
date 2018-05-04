import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {calculateRadiusFromArea, drawHalfCircle} from '../../../utils/circluarCharts/circularCharts';
import {setupSvg} from '../../../utils/svgInit/svgInit';
import {getLargerValue} from '../../../utils/numbers/numbers';
import {RunType} from '../../../store/state';
import {formatZoneRangesToString} from '../../../utils/zones/zones';
import {ZoneColors} from '../../../models/VisualVariableModel';

@Component({
  template: require('./zoneChart.html'),
})
export class ZoneChart extends Vue {

  @Prop()
  zones: any;

  @Watch('zones.pace')
  @Watch('zones.heartrate')
  onPropertyChanged(val: any, oldVal: any) {
    console.log('changed');
    if (this.zones !== undefined) {
      console.log(this.zones);
      this.zoneChart('#' + 'zone', {width: 1200, height: 300}, this.zones);
    }
  }

  private addText(svg, position, text) {
    svg.append('text')
      .attr('x', position.x)
      .attr('y', position.y)
      .attr('class', 'zoneChart__zone')
      .attr('text-anchor', 'left')
      .text(text);
  }

  private drawChartItem(svg, position, upperCircle, lowerCircle, textPosition) {
    drawHalfCircle(svg, position, upperCircle.radius, upperCircle.color, false);
    this.addText(svg, textPosition, upperCircle.text);
    position.y += 40;
    drawHalfCircle(svg, position, lowerCircle.radius, lowerCircle.color, true);
    textPosition.y = position.y - 3;
    this.addText(svg, textPosition, lowerCircle.text);
  }


  private zoneChart(root, canvasConstraints, data): void {
    let svg = setupSvg(root, canvasConstraints.width, canvasConstraints.height);

    let startPos = {
      x: 0,
      y: 100,
    };

    let maxValue = 0;
    for (let i = 0; i < data.pace.distribution_buckets.length; i++) {
      maxValue = getLargerValue(data.pace.distribution_buckets[i].time, maxValue);
      maxValue = getLargerValue(data.heartrate.distribution_buckets[i].time, maxValue);
    }

    const circleParameter = {
      maximum: maxValue,
      radius: 2000,
    };

    for (let i = 0; i < data.pace.distribution_buckets.length; i++) {
      console.log('hr', data.heartrate.distribution_buckets[i]);
      console.log('pace', data.pace.distribution_buckets[i]);

      let upperCircle = {
        radius: calculateRadiusFromArea(data.pace.distribution_buckets[i].time, circleParameter),
        text: formatZoneRangesToString(data.pace.distribution_buckets[i].min, data.pace.distribution_buckets[i].max, 2, 'pace'),
        color: ZoneColors.Pace,
      };

      let lowerCircle = {
        radius: calculateRadiusFromArea(data.heartrate.distribution_buckets[i].time, circleParameter),
        text: formatZoneRangesToString(data.heartrate.distribution_buckets[i].min, data.heartrate.distribution_buckets[i].max, 0, 'heartrate'),
        color: ZoneColors.Heartrate,
      };

      let textPos = {
        x: startPos.x,
        y: startPos.y + 12,
      };

      this.drawChartItem(svg, startPos, upperCircle, lowerCircle, textPos);
      startPos.y -= 40;
      startPos.x += getLargerValue(upperCircle.radius, lowerCircle.radius) * 2 + 10;
    }
  }

  mounted() {
    this.zoneChart('#' + 'zone', {width: 1200, height: 300}, this.zones);
  }
}
