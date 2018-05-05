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

  private barChart(root: string, canvasConstraints, activity: ActivityModel) {
    console.log(activity);
    let svg = setupSvg(root, canvasConstraints.width, canvasConstraints.height);
    let data = this.extractLapsFromActivity(activity);
    let offset = 5;
    let drawNextToEachOther = true;

    let offsetBars = 2;
    let padding = 10;

    let startPos: PositionModel = {
      x: padding,
      y: canvasConstraints.height / 2,
    };

    let maxValues = this.maxZoneValues(data.zones);
    let displayedWidth = this.displayedWidth(canvasConstraints.width, data.laps.length, offsetBars, offset, padding, drawNextToEachOther);
    let pxPerDistance = this.calculatePxPerDistance(displayedWidth, data.base_data.distance, drawNextToEachOther);


    data.laps.map((lap, i) => {
      startPos.x = this.drawChartItem(svg, lap, pxPerDistance, maxValues, startPos, drawNextToEachOther, offsetBars, offset);
    });

    this.addDivider(svg, 0, startPos.y, startPos.x  + 10,'#E6E6E6');
  }

  /**
   * Draws a single lap with heartrate and pacebar
   * @param svg
   * @param lap
   * @param {number} pxPerDistance
   * @param maxValues
   * @param {PositionModel} startPos
   * @param {boolean} drawNextToEachOther
   * @param {number} offsetBars
   * @param {number} offsetLaps
   * @returns {number}
   */
  public drawChartItem(svg, lap, pxPerDistance: number, maxValues, startPos: PositionModel, drawNextToEachOther: boolean, offsetBars: number, offsetLaps: number,) {
    let width = this.calculateWidth(lap.distance, pxPerDistance);
    let paceHeight = this.calculateHeight(lap.average_speed, maxValues.pace, 150);
    let hrHeight = this.calculateHeight(lap.average_heartrate, maxValues.heartrate, 150);

    this.drawBar(svg, startPos.x, startPos.y - paceHeight, width, paceHeight, 0.7, '#43b3e6');

    if (!drawNextToEachOther) {
      this.drawBar(svg, startPos.x, startPos.y, width, hrHeight, 0.7, '#ec407a');
      startPos.x += (width + offsetLaps);
    } else {
      startPos.x += width + offsetBars;
      this.drawBar(svg, startPos.x, startPos.y -hrHeight, width, hrHeight, 0.7, '#ec407a');
      startPos.x += (width + offsetLaps);
    }

    return startPos.x;

  }

  /**
   * Draws a horizontal divider between hr and pace bars
   * @param svg
   * @param {number} xPosition
   * @param {number} yPosition
   * @param {number} width
   * @param {string} color
   */
  private addDivider(svg, xPosition: number, yPosition: number, width: number, color: string) {
    svg.append('rect')
      .attr('x', xPosition)
      .attr('y', yPosition)
      .attr('width', width)
      .attr('height', 1)
      .attr('fill', color);
  }

  /**
   * Extracts the maximum values from every zone
   * @param zones
   * @returns {{pace: number; heartrate: number}}
   */
  private maxZoneValues(zones) {
    let paceZoneMax = 0;
    let heartrateZoneMax = 0;

    for (let key in zones) {
      for (let i = 0; i < zones[key].distribution_buckets.length; i++) {
        if (key === 'pace') {
          paceZoneMax = getLargerValue(zones[key].distribution_buckets[i].max, paceZoneMax);
        } else {
          heartrateZoneMax = getLargerValue(zones[key].distribution_buckets[i].max, heartrateZoneMax);
        }
      }
    }

    return {
      pace: paceZoneMax,
      heartrate: heartrateZoneMax,
    }
  }

  /**
   * Combines the needed data from all given sources
   * @param activity
   * @returns {{laps: any | any[]; zones: any | ActivityZoneModel; streams: any | ActivityStreamModel; base_data: any | ActivityDetailBaseData | ActivityBaseData}}
   */
  private extractLapsFromActivity(activity) {
    return {
      laps: activity.details.laps,
      zones: activity.zones,
      streams: activity.streams,
      base_data: activity.base_data,
    }
  }

  /**
   * Draws a bar
   * @param svg
   * @param {number} xPosition
   * @param {number} yPosition
   * @param {number} width
   * @param {number} height
   * @param {number} opacity
   * @param {string} color
   */
  private drawBar(svg, xPosition: number, yPosition: number, width: number, height: number, opacity: number, color: string) {
    svg.append('rect')
      .attr('x', xPosition)
      .attr('y', yPosition)
      .attr('width', width)
      .attr('height', height)
      .attr('opacity', opacity)
      .attr('fill', color);
  }

  /**
   * Calculates the height of every bar
   * @param {number} value
   * @param {number} indexValue
   * @param {number} indexHeight
   * @returns {number}
   */
  private calculateHeight(value: number, indexValue: number, indexHeight: number) {
    let percentage = (100 / indexValue * value) / 100;
    return indexHeight * percentage;
  }

  /**
   * Calculates the width of every bar
   * @param {number} distance
   * @param {number} pxPerDistance
   * @returns {number}
   */
  private calculateWidth(distance: number, pxPerDistance: number) {
    return distance * pxPerDistance;
  }

  /**
   * Calculates how many pixels display one meter
   * @param {number} displayedWidth
   * @param {number} totalDistance
   * @param {boolean} drawNextToEachOther
   * @returns {number}
   */
  private calculatePxPerDistance(displayedWidth: number, totalDistance: number, drawNextToEachOther: boolean) {
    if (drawNextToEachOther) {
      return displayedWidth / (totalDistance * 2);
    } else {
      return displayedWidth / totalDistance;
    }
  };

  private displayedWidth(canvasWidth: number, amountLaps: number, offsetBars: number, offsetLaps: number, padding: number, drawNextToEachOther: boolean) {
    if (drawNextToEachOther) {
      return (canvasWidth - ((amountLaps * offsetBars) + ((amountLaps - 1) * offsetLaps) + (padding * 2)));
    } else {
      return (canvasWidth - (((amountLaps - 1) * offsetLaps) + (padding * 2)));
    }
  }

  mounted() {
    this.barChart('#' + this.root, {width: 1140, height: 400, marginBottom: 20, canvasOffset: 10}, this.activity);
  }
}
