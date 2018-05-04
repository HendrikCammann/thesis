import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {calculateRadiusFromArea} from '../../../utils/circluarCharts/circularCharts';
import {setupSvg} from '../../../utils/svgInit/svgInit';
import {getLargerValue, getPercentageFromValue} from '../../../utils/numbers/numbers';
import {formatZoneRangesToString} from '../../../utils/zones/zones';
import {CategoryOpacity, ZoneColors} from '../../../models/VisualVariableModel';
import * as d3 from 'd3';

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

  private drawHalfCircle(svg, position, center, radius, color, time, bottomHalf, id): void {
    let arc = d3.arc();
    let startAngle = -Math.PI * 0.5;
    let endAngle = Math.PI * 0.5;
    let hoverOffset = 22;

    if (bottomHalf) {
      startAngle = Math.PI * 0.5;
      endAngle = Math.PI * 1.5;
      hoverOffset *= -1;
    }

    let fullId = 'arc' + id + bottomHalf;
    let fullPartnerId = 'arc' + id + !bottomHalf;

    let xPos = position.x;
    let yPos = position.y;

    svg.append('path')
      .attr('transform', 'translate(' + [ xPos + center, yPos ] + ')')
      .attr('opacity', CategoryOpacity.Active)
      .attr('id', fullId)
      .attr('fill', color)
      .attr('d', arc({
        innerRadius: 0,
        outerRadius: radius,
        startAngle: startAngle,
        endAngle: endAngle
      }))
      .on('mouseenter', () => {
        d3.select('#' + fullId)
          .transition()
          .attr('transform', 'translate(' + [ xPos + center, yPos - hoverOffset ] + ')');
        d3.select('#' + fullPartnerId)
          .transition()
          .attr('transform', 'translate(' + [ xPos + center, yPos + hoverOffset ] + ')');

        d3.select('#' + fullId + 'text')
          .transition()
          .attr('opacity', 1);
        d3.select('#' + fullPartnerId + 'text')
          .transition()
          .attr('opacity', 1);

        d3.select('#' + fullId + 'label')
          .transition()
          .attr('transform', 'translate(' + [ 0, - hoverOffset ] + ')');
        d3.select('#' + fullPartnerId + 'label')
          .transition()
          .attr('transform', 'translate(' + [ 0, hoverOffset ] + ')');
      })
      .on('mouseleave', () => {
        d3.select('#' + fullId)
          .transition()
          .attr('transform', 'translate(' + [ xPos + center, yPos ] + ')');
        d3.select('#' + fullPartnerId)
          .transition()
          .attr('transform', 'translate(' + [ xPos + center, yPos ] + ')');

        d3.select('#' + fullId + 'text')
          .transition()
          .attr('opacity', 0);
        d3.select('#' + fullPartnerId + 'text')
          .transition()
          .attr('opacity', 0);

        d3.select('#' + fullId + 'label')
          .transition()
          .attr('transform', 'translate(0, 0)');
        d3.select('#' + fullPartnerId + 'label')
          .transition()
          .attr('transform', 'translate(0, 0)');
      });
  }

  private addText(svg, position, text, classNames, bottomHalf, id) {
    let posY = position.y;
    if (bottomHalf) {
      posY += 16;
    } else {
      posY -= 5;
    }
    let fullId = 'arc' + id + bottomHalf + 'text';
    svg.append('text')
      .attr('x', position.x)
      .attr('y', posY)
      .attr('id', fullId)
      .attr('class', classNames)
      .attr('text-anchor', 'middle')
      .attr('opacity', 0)
      .text(text);
  }

  private addLabel(svg, position, centerPosition, text, classNames, bottomHalf, id) {
    let fullId = 'arc' + id + bottomHalf + 'label';
    let posY = position.y;
    if (bottomHalf) {
      posY += 16;
    } else {
      posY -= 5;
    }
    svg.append('text')
      .attr('x', position.x + centerPosition)
      .attr('y', posY)
      .attr('class', classNames)
      .attr('text-anchor', 'middle')
      .attr('id', fullId)
      .text(text + '%');
  }

  private drawChartItem(svg, position, centerPosition, upperCircle, lowerCircle, textPosition, index) {

    this.addText(svg, textPosition, upperCircle.text, 'zoneChart__text zoneChart__text--pace', false, index);
    this.drawHalfCircle(svg, position, centerPosition, upperCircle.radius, upperCircle.color, upperCircle.time, false, index);
    this.addLabel(svg, position, centerPosition, upperCircle.percentageOfTotalTime, 'zoneChart__label', false, index);

    this.drawHalfCircle(svg, position, centerPosition, lowerCircle.radius, lowerCircle.color, upperCircle.time, true, index);
    this.addText(svg, textPosition, lowerCircle.text, 'zoneChart__text zoneChart__text--heartrate', true, index);
    this.addLabel(svg, position, centerPosition, lowerCircle.percentageOfTotalTime, 'zoneChart__label', true, index);
  }

  private zoneChart(root, canvasConstraints, data): void {
    let svg = setupSvg(root, canvasConstraints.width, canvasConstraints.height);
    let horizontalMargin = 20;

    let startPos = {
      x: 10,
      y: 100,
    };

    let maxValue = 0;
    let totalTimePace = 0;
    let totalTimeHeartrate = 0;
    for (let i = 0; i < data.pace.distribution_buckets.length; i++) {
      totalTimePace += data.pace.distribution_buckets[i].time;
      totalTimeHeartrate += data.heartrate.distribution_buckets[i].time;

      maxValue = getLargerValue(data.pace.distribution_buckets[i].time, maxValue);
      maxValue = getLargerValue(data.heartrate.distribution_buckets[i].time, maxValue);
    }

    const circleParameter = {
      maximum: maxValue,
      radius: 2000,
    };

    for (let i = 0; i < data.pace.distribution_buckets.length; i++) {
      let upperCircle = {
        radius: calculateRadiusFromArea(data.pace.distribution_buckets[i].time, circleParameter),
        percentageOfTotalTime: getPercentageFromValue(data.pace.distribution_buckets[i].time, totalTimePace),
        time: data.pace.distribution_buckets[i].time,
        text: formatZoneRangesToString(data.pace.distribution_buckets[i].min, data.pace.distribution_buckets[i].max, 2, 'pace'),
        color: ZoneColors.Pace,
      };

      let lowerCircle = {
        radius: calculateRadiusFromArea(data.heartrate.distribution_buckets[i].time, circleParameter),
        percentageOfTotalTime: getPercentageFromValue(data.heartrate.distribution_buckets[i].time, totalTimeHeartrate),
        time: data.heartrate.distribution_buckets[i].time,
        text: formatZoneRangesToString(data.heartrate.distribution_buckets[i].min, data.heartrate.distribution_buckets[i].max, 0, 'heartrate'),
        color: ZoneColors.Heartrate,
      };

      let centerPos = getLargerValue(upperCircle.radius, lowerCircle.radius);

      let textPos = {
        x: startPos.x + centerPos,
        y: startPos.y,
      };

      this.drawChartItem(svg, startPos, centerPos, upperCircle, lowerCircle, textPos, i);

      if (i !== data.pace.distribution_buckets.length - 1) {
        startPos.x += getLargerValue(upperCircle.radius, lowerCircle.radius) * 2 + horizontalMargin;
      } else {
        startPos.x += getLargerValue(upperCircle.radius, lowerCircle.radius) * 2;
      }
    }

    svg.append('rect')
      .attr('x', 0)
      .attr('y', startPos.y)
      .attr('width', startPos.x + 10)
      .attr('height', 1)
      .attr('fill', 'black')
      .attr('opacity', 0.2);
  }

  mounted() {
    this.zoneChart('#' + 'zone', {width: 1200, height: 300}, this.zones);
  }
}
