import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {setupSvg} from '../../../utils/svgInit/svgInit';
import {getLargerValue, getPercentageFromValue} from '../../../utils/numbers/numbers';
import * as d3 from 'd3';
import {PositionModel} from '../../../models/Chart/ChartModels';
import {ActivityZoneModel} from '../../../models/Activity/ActivityZoneModel';
import {sumArray} from '../../../utils/array-helper';

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
  private offset = 8;
  private itemArea = 115;

  private zoneChart(root: string, width: number, height: number, offset: number, zones: ActivityZoneModel) {
    let hasHeartrate = zones.heartrate !== undefined;
    let drawableWidth = this.itemArea;

    let maxValues = this.getMaxValues(zones, hasHeartrate);
    console.log(maxValues);
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
      y: 0,
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
        color: '#216e9a',
        xPos: position.x,
        yPos: position.y,
        percentage: getPercentageFromValue(zones.pace.distribution_buckets[i].time, maxValues.full)
      };

      paceCircles.push(paceItem);

      // CREATE HRCIRCLE
      if (hasHeartrate) {
        let hrPercentage = getPercentageFromValue(zones.heartrate.distribution_buckets[i].time, maxValues.total) / 100;
        let hrRadius = (width * hrPercentage) / 2;
        let hrItem = {
          radius: hrRadius,
          color: '#d23d49',
          xPos: position.x,
          yPos: position.y,
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
      height: position.y,
    };
  }

  private drawCircles(circles, svg) {
    this.drawDivider(svg, this.width / 2, 0, this.height - this.offset);
    for (let i = 0; i < circles.offsetCircles.length; i++) {
      if (i === 0) {
        this.addLabel(svg, 0, circles.offsetCircles[i].yPos, 'langsam', 'left', '#216e9a', 0.5);
        this.addLabel(svg, this.width - 35, circles.offsetCircles[i].yPos, 'locker', 'right', '#d23d49', 0.5);
      }
      if (i === circles.offsetCircles.length - 1) {
        this.addLabel(svg, 0, circles.offsetCircles[i].yPos, 'schnell', 'left', '#216e9a', 0.5);
        this.addLabel(svg, this.width - 65, circles.offsetCircles[i].yPos, 'anstregend', 'right', '#d23d49', 0.5);
      }
      this.drawFullCircle(svg, circles.offsetCircles[i].xPos, circles.offsetCircles[i].yPos, circles.maxCircle.radius, '#E7E7E7', 0.3);
      this.drawFullCircle(svg, circles.offsetCircles[i].xPos, circles.offsetCircles[i].yPos, circles.offsetCircles[i].radius, circles.offsetCircles[i].color, 0.2);
      if (circles.hrCircles[i]) {
        this.drawHalfCircle(svg, circles.hrCircles[i].xPos, circles.hrCircles[i].yPos, circles.hrCircles[i].radius, circles.hrCircles[i].color, true, 1);
        this.addPerc(svg, circles.offsetCircles[i].xPos + circles.maxCircle.radius + 5, circles.offsetCircles[i].yPos, circles.hrCircles[i].percentage + '%', 'left', '#d23d49', 1);
      }
      this.drawHalfCircle(svg, circles.paceCircles[i].xPos, circles.paceCircles[i].yPos, circles.paceCircles[i].radius, circles.paceCircles[i].color, false, 1);
      this.addPerc(svg, circles.offsetCircles[i].xPos - circles.maxCircle.radius - 29, circles.offsetCircles[i].yPos, circles.paceCircles[i].percentage + '%', 'right', '#216e9a', 1);
      this.addText(svg, circles.paceCircles[i].xPos, circles.paceCircles[i].yPos, (i + 1));
    }
  }

  private drawDivider(svg, x: number, y: number, height: number) {
    svg.append('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('width', 1)
      .attr('height', height)
      .attr('fill', '#adb7bf');
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
      .attr('y', y - 8)
      .attr('class', 'zoneChart__zone-number')
      .attr('text-anchor', 'middle')
      .text(text);
  }

  private addLabel(svg, x: number, y: number, text: string | number , anchor: string, color: string, opacity: number) {
    svg.append('text')
      .attr('x', x)
      .attr('y', y + 2)
      .attr('class', 'zoneChart__zone-label')
      .attr('text-anchor', anchor)
      .attr('opacity', opacity)
      .attr('fill', color)
      .text(text);
  }

  private addPerc(svg, x: number, y: number, text: string | number , anchor: string, color: string, opacity: number) {
    svg.append('text')
      .attr('x', x)
      .attr('y', y + 3)
      .attr('class', 'zoneChart__zone-perc')
      .attr('text-anchor', anchor)
      .attr('opacity', opacity)
      .attr('fill', color)
      .text(text);
  }

  /**
   * Vue lifecycle method
   */
  mounted() {
    this.zoneChart('#' + this.root, this.width, this.height, this.offset, this.zones);
  }
}
