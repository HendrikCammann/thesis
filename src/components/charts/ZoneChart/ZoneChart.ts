import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {calculateRadiusFromArea} from '../../../utils/circluarCharts/circularCharts';
import {setupSvg} from '../../../utils/svgInit/svgInit';
import {getLargerValue, getPercentageFromValue} from '../../../utils/numbers/numbers';
import {formatZoneRangesToString} from '../../../utils/zones/zones';
import {CategoryOpacity, ZoneColors} from '../../../models/VisualVariableModel';
import * as d3 from 'd3';
import {PositionModel} from '../../../models/Chart/ChartModels';
import {ActivityZoneModel} from '../../../models/Activity/ActivityZoneModel';
import {FormatDurationType} from '../../../models/FormatModel';
import {formatSecondsToDuration} from '../../../utils/time/time-formatter';

class CircleItem {
  radius: number;
  labelText: string;
  time: number;
  text: string;
  color: ZoneColors;

  constructor () {
    this.radius = 0;
    this.labelText = '';
    this.time = 0;
    this.text = '';
    this.color = ZoneColors.Pace;
  }
}

@Component({
  template: require('./zoneChart.html'),
})
export class ZoneChart extends Vue {

  @Prop()
  root: string;

  @Prop()
  zones: ActivityZoneModel | any;

  /**
   * Draws a single halfcircle to a given position
   * @param svg
   * @param {PositionModel} position
   * @param {number} radius
   * @param {string} color
   * @param {number} time
   * @param {boolean} bottomHalf
   * @param {number} id
   */
  private drawHalfCircle(svg, position: PositionModel, radius: number, color: string, time: number, bottomHalf: boolean, id: number): void {
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
      .attr('transform', 'translate(' + [ xPos, yPos ] + ')')
      .attr('opacity', CategoryOpacity.Active)
      .attr('id', fullId)
      .attr('fill', color)
      .attr('class', 'zoneChart__circle')
      .attr('d', arc({
        innerRadius: 0,
        outerRadius: radius,
        startAngle: startAngle,
        endAngle: endAngle
      }))
      .on('mouseenter', () => {
        d3.select('#' + fullId)
          .transition()
          .attr('transform', 'translate(' + [ xPos, yPos - hoverOffset ] + ')');
        d3.select('#' + fullPartnerId)
          .transition()
          .attr('transform', 'translate(' + [ xPos, yPos + hoverOffset ] + ')');

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
          .attr('transform', 'translate(' + [ xPos, yPos ] + ')');
        d3.select('#' + fullPartnerId)
          .transition()
          .attr('transform', 'translate(' + [ xPos, yPos ] + ')');

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

  /**
   * Adds a text to a given position
   * @param svg
   * @param {PositionModel} position
   * @param {string} text
   * @param {string} classNames
   * @param {boolean} bottomHalf
   * @param {number} id
   */
  private addText(svg, position: PositionModel, text: string, classNames: string, bottomHalf: boolean, id: number): void {
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

  /**
   * Adds a label to a given position
   * @param svg
   * @param {PositionModel} position
   * @param {string | number} text
   * @param {string} classNames
   * @param {boolean} bottomHalf
   * @param {number} id
   */
  private addLabel(svg, position: PositionModel, text: string | number, classNames: string, bottomHalf: boolean, id: number): void {
    let fullId = 'arc' + id + bottomHalf + 'label';
    let posY = position.y;
    if (bottomHalf) {
      posY += 16;
    } else {
      posY -= 5;
    }
    svg.append('text')
      .attr('x', position.x)
      .attr('y', posY)
      .attr('class', classNames)
      .attr('text-anchor', 'middle')
      .attr('id', fullId)
      .text(text);
  }

  /**
   * Draws a single item of the Chart
   * Combines drawHalfCircle, addText and addLabel
   * @param svg
   * @param {PositionModel} position
   * @param {CircleItem} upperCircle
   * @param {CircleItem} lowerCircle
   * @param {PositionModel} textPosition
   * @param {number} index
   * @param {boolean} drawHeartrate
   */
  private drawChartItem(svg, position: PositionModel, upperCircle: CircleItem, lowerCircle: CircleItem, textPosition: PositionModel, index: number, drawHeartrate: boolean): void {

    this.addText(svg, textPosition, upperCircle.text, 'zoneChart__text zoneChart__text--pace', false, index);
    this.drawHalfCircle(svg, position, upperCircle.radius, upperCircle.color, upperCircle.time, false, index);
    this.addLabel(svg, position, upperCircle.labelText, 'zoneChart__label', false, index);

    if (drawHeartrate) {
      this.drawHalfCircle(svg, position, lowerCircle.radius, lowerCircle.color, upperCircle.time, true, index);
      this.addText(svg, textPosition, lowerCircle.text, 'zoneChart__text zoneChart__text--heartrate', true, index);
      this.addLabel(svg, position, lowerCircle.labelText, 'zoneChart__label', true, index);
    }
  }

  /**
   * Adds a divider between the upper and lower circles
   * @param svg
   * @param {PositionModel} position
   * @param {number} width
   */
  private addDivider (svg, position: PositionModel, width: number): void {
    svg.append('rect')
      .attr('x', position.x)
      .attr('y', position.y)
      .attr('width', width)
      .attr('height', 1)
      .attr('fill', '#E6E6E6');
  }

  /**
   * Draws the diagram and keeps track of positioning and margins
   * @param {string} root
   * @param canvasConstraints
   * @param {ActivityZoneModel} data
   */
  private zoneChart(root: string, canvasConstraints, data: ActivityZoneModel): void {
    let svg = setupSvg(root, canvasConstraints.width, canvasConstraints.height);
    let showPercentage: boolean = true;
    let hasHeartrate: boolean = true;
    let offsetPaceAndHr: any = {
      differences: [],
      totalDifference: 0,
      morePace: [],
      pace: [],
      hr: [],
      differenceInPercent: 0,
    };

    if (!data.heartrate) {
      hasHeartrate = false;
    }

    let startPos: PositionModel = {
      x: canvasConstraints.canvasOffset,
      y: 100,
    };

    let maxValue: number = 0;
    let totalTimePace: number = 0;
    let totalTimeHeartrate: number = 0;
    for (let i = 0; i < data.pace.distribution_buckets.length; i++) {
      totalTimePace += data.pace.distribution_buckets[i].time;
      maxValue = getLargerValue(data.pace.distribution_buckets[i].time, maxValue);
      if (hasHeartrate) {
        totalTimeHeartrate += data.heartrate.distribution_buckets[i].time;
        maxValue = getLargerValue(data.heartrate.distribution_buckets[i].time, maxValue);
      }
    }

    const circleParameter = {
      maximum: maxValue,
      radius: 2000,
    };

    for (let i = 0; i < data.pace.distribution_buckets.length; i++) {
      let upperCircle: CircleItem = {
        radius: calculateRadiusFromArea(data.pace.distribution_buckets[i].time, circleParameter),
        labelText: '',
        time: data.pace.distribution_buckets[i].time,
        text: formatZoneRangesToString(data.pace.distribution_buckets[i].min, data.pace.distribution_buckets[i].max, 2, 'pace'),
        color: ZoneColors.Pace,
      };
      let lowerCircle = new CircleItem();
      if (hasHeartrate) {
        lowerCircle.radius = calculateRadiusFromArea(data.heartrate.distribution_buckets[i].time, circleParameter);
        lowerCircle.labelText = '';
        lowerCircle.time = data.heartrate.distribution_buckets[i].time;
        lowerCircle.text = formatZoneRangesToString(data.heartrate.distribution_buckets[i].min, data.heartrate.distribution_buckets[i].max, 0, 'heartrate');
        lowerCircle.color = ZoneColors.Heartrate;
      }

      if (showPercentage) {
        upperCircle.labelText = getPercentageFromValue(data.pace.distribution_buckets[i].time, totalTimePace) + '%';
        if (hasHeartrate) {
          lowerCircle.labelText = getPercentageFromValue(data.heartrate.distribution_buckets[i].time, totalTimeHeartrate) + '%';
        }
      } else {
        upperCircle.labelText = formatSecondsToDuration(data.pace.distribution_buckets[i].time, FormatDurationType.Minutes).multilple;
        if (hasHeartrate) {
          lowerCircle.labelText = formatSecondsToDuration(data.heartrate.distribution_buckets[i].time, FormatDurationType.Minutes).multilple;
        }
      }

      let textPos: PositionModel = {
        x: startPos.x + getLargerValue(upperCircle.radius, lowerCircle.radius),
        y: startPos.y,
      };

      startPos.x += getLargerValue(upperCircle.radius, lowerCircle.radius);

      if (hasHeartrate) {
        offsetPaceAndHr.pace.push(data.pace.distribution_buckets[i].time );
        offsetPaceAndHr.hr.push(data.heartrate.distribution_buckets[i].time );
        offsetPaceAndHr.morePace.push(data.pace.distribution_buckets[i].time > data.heartrate.distribution_buckets[i].time);
        offsetPaceAndHr.differences.push(Math.abs(data.pace.distribution_buckets[i].time - data.heartrate.distribution_buckets[i].time));
        offsetPaceAndHr.totalDifference += Math.abs(data.pace.distribution_buckets[i].time - data.heartrate.distribution_buckets[i].time);
      }

      this.drawChartItem(svg, startPos, upperCircle, lowerCircle, textPos, i, hasHeartrate);

      if (i !== data.pace.distribution_buckets.length - 1) {
        startPos.x += getLargerValue(upperCircle.radius, lowerCircle.radius) + canvasConstraints.marginBottom;
      } else {
        startPos.x += getLargerValue(upperCircle.radius, lowerCircle.radius);
      }

    }
    offsetPaceAndHr.differenceInPercent = getPercentageFromValue(offsetPaceAndHr.totalDifference, totalTimeHeartrate);
    if (offsetPaceAndHr.differenceInPercent < 80) {
      console.log('ok');
    } else if (offsetPaceAndHr.differenceInPercent < 120 && offsetPaceAndHr.differenceInPercent > 80) {
      console.log('minimal verschoben');
    } else if (offsetPaceAndHr.differenceInPercent < 150 && offsetPaceAndHr.differenceInPercent > 120) {
      console.log('etwas verschoben');
    } else if (offsetPaceAndHr.differenceInPercent > 150) {
      console.log('stark verschoben');
    }
    // console.log(this.isHeartrateOffest(offsetPaceAndHr.morePace));
    // console.log(offsetPaceAndHr);



    this.addDivider(svg, {x: 0, y: startPos.y}, startPos.x + canvasConstraints.canvasOffset);
  }

  private isHeartrateOffest(array) {
    let ctnTrue = 0;
    let ctnFalse = 0;

    array.map(value => {
      if (value === true) {
        ctnTrue++;
      } else {
        ctnFalse++;
      }
    });

    console.log(ctnTrue + 'vs ' + ctnFalse);
    return ctnTrue < ctnFalse;
  }
  /**
   * Vue lifecycle method
   */
  mounted() {
    this.zoneChart('#' + this.root, {width: 554, height: 300, marginBottom: 20, canvasOffset: 10}, this.zones);
  }
}
