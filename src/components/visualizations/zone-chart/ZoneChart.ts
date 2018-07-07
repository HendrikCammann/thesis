import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {setupSvg} from '../../../utils/svgInit/svgInit';
import {getLargerValue, getPercentageFromValue} from '../../../utils/numbers/numbers';
import * as d3 from 'd3';
import {PositionModel} from '../../../models/Chart/ChartModels';
import {ActivityZoneModel} from '../../../models/Activity/ActivityZoneModel';
import {sumArray} from '../../../utils/array-helper';
import {formatPace} from '../../../utils/format-data';
import {FormatPaceType} from '../../../models/FormatModel';
import {ZoneColors} from '../../../models/VisualVariableModel';

@Component({
  template: require('./zoneChart.html'),
})
export class ZoneChart extends Vue {

  @Prop()
  root: string;

  @Prop()
  zones: ActivityZoneModel | any;

  private width = 340;
  private height = 600;
  private offset = 44;
  private itemArea = 115;

  private zoneChart(root: string, width: number, height: number, offset: number, zones: ActivityZoneModel) {
    let hasHeartrate = zones.heartrate !== undefined;
    let drawableWidth = this.itemArea;

    let maxValues = this.getMaxValues(zones, hasHeartrate);
    let circles = this.createCircles(zones, hasHeartrate, drawableWidth, maxValues);
    this.height = circles.height;
    let svg = setupSvg(root, width, circles.height);
    this.drawCircles(circles, svg);
  }

  private getMaxValues(zones: ActivityZoneModel, hasHeartrate: boolean) {
    let maxValues = [];
    let maxValue = 0;
    let total = 0;

    zones.pace.distribution_buckets.forEach(item => {
      maxValues.push(item.time);
      maxValue = getLargerValue(item.time, maxValue);
      total += item.time;
    });

    if (hasHeartrate) {
      zones.heartrate.distribution_buckets.forEach((item, i) => {
        maxValues[i] = getLargerValue(item.time, maxValues[i]);
        maxValue = getLargerValue(item.time, maxValue);
      });
    }


    return {
      perZone: maxValues,
      fullAllZones: sumArray(maxValues),
      total: maxValue,
      full: total,
    };

  }

  private createCircles(zones: ActivityZoneModel, hasHeartrate: boolean, width: number, maxValues) {
    let position: PositionModel = {
      x: this.width / 2,
      y: 16,
    };

    let offsetCircles = [];
    let paceCircles = [];
    let hrCircles = [];
    let maxCircle = {
      radius: this.itemArea / 2,
    };

    for (let i = 0; i < maxValues.perZone.length; i++) {
      let percentage = getPercentageFromValue(maxValues.perZone[i], maxValues.total) / 100;
      let radius = (width * percentage) / 2;
      position.y += (this.itemArea / 2);

      let color = '#d23d49';
      if (hasHeartrate) {
        if (zones.heartrate.distribution_buckets[i].time > zones.pace.distribution_buckets[i].time) {
          color = '#216e9a';
        }
      }

      // CREATE PACECIRCLE
      let pacePercentage = getPercentageFromValue(zones.pace.distribution_buckets[i].time, maxValues.total) / 100;
      let paceRadius = (width * pacePercentage) / 2;
      let paceItem = {
        radius: paceRadius,
        color: ZoneColors.Pace,
        xPos: position.x,
        yPos: position.y,
        max: zones.pace.distribution_buckets[i].max,
        min: zones.pace.distribution_buckets[i].min,
        percentage: getPercentageFromValue(zones.pace.distribution_buckets[i].time, maxValues.full)
      };

      paceCircles.push(paceItem);

      // CREATE HRCIRCLE
      if (hasHeartrate) {
        let hrPercentage = getPercentageFromValue(zones.heartrate.distribution_buckets[i].time, maxValues.total) / 100;
        let hrRadius = (width * hrPercentage) / 2;
        let hrItem = {
          radius: hrRadius,
          color: ZoneColors.Heartrate,
          xPos: position.x,
          yPos: position.y,
          max: zones.heartrate.distribution_buckets[i].max,
          min: zones.heartrate.distribution_buckets[i].min,
          percentage: getPercentageFromValue(zones.heartrate.distribution_buckets[i].time, maxValues.full),
        };

        hrCircles.push(hrItem);
      }

      // OFFSET CIRCLE
      let item = {
        radius: radius,
        color: color,
        xPos: position.x,
        yPos: position.y,
      };

      offsetCircles.push(item);

      position.y += (this.itemArea / 2);
      position.y += this.offset;
    }

    return {
      offsetCircles: offsetCircles,
      paceCircles: paceCircles,
      hrCircles: hrCircles,
      maxCircle: maxCircle,
      height: position.y + 16 - this.offset,
    };
  }

  private drawCircles(circles, svg) {
    for (let i = 0; i < circles.offsetCircles.length; i++) {
      this.drawFullCircle(svg, circles.offsetCircles[i].xPos, circles.offsetCircles[i].yPos, circles.maxCircle.radius, '#E7E7E7', 0.3);
      this.drawFullCircle(svg, circles.offsetCircles[i].xPos, circles.offsetCircles[i].yPos, circles.offsetCircles[i].radius, circles.offsetCircles[i].color, 0.1);
      if (circles.hrCircles[i]) {
        this.drawHalfCircle(svg, circles.hrCircles[i].xPos, circles.hrCircles[i].yPos, circles.hrCircles[i].radius, circles.hrCircles[i].color, true, 1);
        this.addPerc(svg, circles.offsetCircles[i].xPos + circles.maxCircle.radius + 42, circles.offsetCircles[i].yPos, circles.hrCircles[i].percentage + '%', 'left', ZoneColors.Heartrate, 1);
        this.addLabel(svg, circles.offsetCircles[i].xPos + circles.maxCircle.radius + 56, circles.offsetCircles[i].yPos, null, 'middle', '#80909D', 1, circles.hrCircles[i]);
      }
      this.drawHalfCircle(svg, circles.paceCircles[i].xPos, circles.paceCircles[i].yPos, circles.paceCircles[i].radius, circles.paceCircles[i].color, false, 1);
      this.addPerc(svg, circles.offsetCircles[i].xPos - circles.maxCircle.radius - 66, circles.offsetCircles[i].yPos, circles.paceCircles[i].percentage + '%', 'right', ZoneColors.Pace, 1);
      this.addLabel(svg, circles.offsetCircles[i].xPos - circles.maxCircle.radius - 56, circles.offsetCircles[i].yPos, null, 'middle', '#80909D', 1, circles.paceCircles[i]);

      this.drawDivider(svg, circles.offsetCircles[i].xPos, circles.paceCircles[i].yPos - circles.maxCircle.radius, this.height - this.offset);
      this.addText(svg, circles.paceCircles[i].xPos, circles.paceCircles[i].yPos - circles.maxCircle.radius - 18, 'Zone ' + (i + 1));
    }
  }

  private drawDivider(svg, x: number, y: number, height: number) {
    svg.append('rect')
      .attr('x', x - 1)
      .attr('y', y)
      .attr('width', 2)
      .attr('height', height)
      .attr('fill', '#FBFAFA');
  }

  private drawHalfCircle(svg, x: number, y: number, radius: number, color: string, bottomHalf: boolean, opacity: number): void {
    let arc = d3.arc();
    let startAngle = Math.PI * 2;
    let endAngle = Math.PI;

    if (bottomHalf) {
      startAngle = -Math.PI * 2;
      endAngle = -Math.PI;
    }

    let xPos = x;
    let yPos = y;

    svg.append('path')
      .attr('transform', 'translate(' + [ xPos, yPos ] + ')')
      .attr('opacity', opacity)
      .attr('fill', color)
      .attr('class', 'zoneChart__circle')
      .attr('d', arc({
        innerRadius: 0,
        outerRadius: radius,
        startAngle: startAngle,
        endAngle: endAngle
      }));
  }

  private drawFullCircle(svg, x: number, y: number, radius: number, color: string, opacity: number): void {
    let arc = d3.arc();
    let startAngle = -Math.PI * 0.5;
    let endAngle = Math.PI * 1.5;

    let xPos = x;
    let yPos = y;

    svg.append('path')
      .attr('transform', 'translate(' + [ xPos, yPos ] + ')')
      .attr('opacity', opacity)
      .attr('fill', color)
      .attr('class', 'zoneChart__circle')
      .attr('d', arc({
        innerRadius: 0,
        outerRadius: radius,
        startAngle: startAngle,
        endAngle: endAngle
      }));
  }

  private addText(svg, x: number, y: number, text: string | number) {
    svg.append('text')
      .attr('x', x)
      .attr('y', y + 14)
      .attr('class', 'zoneChart__zone-number')
      .attr('text-anchor', 'middle')
      .text(text);
  }

  private addLabel(svg, x: number, y: number, text: any, anchor: string, color: string, opacity: number, circle: any) {
    let range = '';
    if (circle.max < 30) {
      if (circle.min === 0) {
        range = '<' + formatPace(circle.max, FormatPaceType.MinPerKm).formattedVal + '/km';
      } else if (circle.max === -1) {
        range = '>' + formatPace(circle.min, FormatPaceType.MinPerKm).formattedVal + '/km';
      } else {
        range = formatPace(circle.min, FormatPaceType.MinPerKm).formattedVal + ' - ' + formatPace(circle.max, FormatPaceType.MinPerKm).formattedVal + '/km';
      }
    } else {
      if (circle.min === 0) {
        range = '<' + circle.max + 'bpm';
      } else if (circle.max === -1) {
        range = '>' + circle.min + 'bpm';
      } else {
        range = circle.min + ' - ' + circle.max + 'bpm';
      }
    }

    svg.append('text')
      .attr('x', x)
      .attr('y', y + 18)
      .attr('class', 'zoneChart__zone-label')
      .attr('text-anchor', anchor)
      .attr('opacity', opacity)
      .attr('fill', color)
      .text(range);
  }

  private addPerc(svg, x: number, y: number, text: any, anchor: string, color: string, opacity: number) {
    let test = svg.append('text')
      .attr('x', x)
      .attr('y', y - 6)
      .attr('class', 'zoneChart__zone-perc')
      .attr('id', (x + y).toFixed(0))
      .attr('text-anchor', anchor)
      .attr('opacity', opacity)
      .attr('fill', 'white')
      .text(text);

    let dimensions = test.node().getBBox();

    svg.append('rect')
      .attr('x', dimensions.x - 16)
      .attr('y', dimensions.y - 4)
      .attr('rx', (dimensions.height + 8) / 2)
      .attr('ry', (dimensions.height + 8) / 2)
      .attr('height', dimensions.height + 8)
      .attr('width', dimensions.width + 32)
      .attr('fill', color);

    svg.append('text')
      .attr('x', x)
      .attr('y', y - 6)
      .attr('class', 'zoneChart__zone-perc')
      .attr('id', (x + y).toFixed(0))
      .attr('text-anchor', anchor)
      .attr('opacity', opacity)
      .attr('fill', 'white')
      .text(text);
  }

  /**
   * Vue lifecycle method
   */
  mounted() {
    this.zoneChart('#' + this.root, this.width, this.height, this.offset, this.zones);
  }
}
