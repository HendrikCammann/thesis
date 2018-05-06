/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {ActivityModel} from '../../../models/Activity/ActivityModel';
import {setupSvg} from '../../../utils/svgInit/svgInit';
import {PositionModel} from '../../../models/Chart/ChartModels';
import {getLargerValue, getPercentageFromValue, getSmallerValue} from '../../../utils/numbers/numbers';
import * as d3 from 'd3';

@Component({
  template: require('./barChart.html'),
})
export class BarChart extends Vue {
  @Prop()
  root: string;

  @Prop()
  activity: ActivityModel | any;

  private barHeight = 2;

  private barChart(root: string, canvasConstraints, activity: ActivityModel) {
    console.log(activity);
    let svg = setupSvg(root, canvasConstraints.width, canvasConstraints.height);
    let data = this.extractLapsFromActivity(activity);
    let offset = 5;
    let drawNextToEachOther = true;
    let chartItems = {
      heartrate: [],
      pace: [],
    };

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
      let hrData = [];
      let paceData = [];

      let minimumValues = {
        lapMinHr: 1000,
        lapMinPace: 1000,
      };
      for (let i = lap.start_index; i <= lap.end_index; i++) {
        minimumValues.lapMinHr = getSmallerValue(data.streams.heartrate.data[i], minimumValues.lapMinHr);
        hrData.push(data.streams.heartrate.data[i]);
        minimumValues.lapMinPace = getSmallerValue(data.streams.speed.data[i], minimumValues.lapMinPace);
        paceData.push(data.streams.speed.data[i]);
      }

      let paceHistorgram = d3.histogram().domain([minimumValues.lapMinPace, maxValues.pace]).thresholds(5);
      let hrHistorgram = d3.histogram().domain([minimumValues.lapMinHr, maxValues.heartrate]).thresholds(5);

      let drawnItem = this.drawChartItem(svg, lap, pxPerDistance, maxValues, minimumValues, startPos, drawNextToEachOther, offsetBars, offset, paceHistorgram(paceData), hrHistorgram(hrData));
      chartItems.pace.push(drawnItem.paceItem);
      chartItems.heartrate.push(drawnItem.heartrateItem);
      startPos.x = drawnItem.xVal;
    });


    // this.connectChartItems(svg, chartItems);
    this.addDivider(svg, 0, startPos.y, startPos.x  + 10,'#E6E6E6');
  }

  private connectChartItems(svg, chartItems) {
    for (let key in chartItems) {
      let color;
      if (key === 'pace') {
        color = '#43b3e6'
      } else {
        color = '#ec407a'
      }
      for (let i = 0; i < chartItems[key].length; i++) {
        if (chartItems[key][i + 1] !== undefined) {
          svg.append('line')
            .style('stroke', color)
            .attr('x1', chartItems[key][i].endX)
            .attr('y1', chartItems[key][i].endY)
            .attr('x2', chartItems[key][i + 1].startX)
            .attr('y2', chartItems[key][i + 1].startY)
            .attr('opacity', 0.5)
        }
      }
    }
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
  private drawChartItem(svg, lap, pxPerDistance: number, maxValues, minimumValues, startPos: PositionModel, drawNextToEachOther: boolean, offsetBars: number, offsetLaps: number, paceHistorgram, hrHistogram) {
    let width = this.calculateWidth(lap.distance, pxPerDistance);

    let paceHeight = this.calculateHeight(lap.average_speed, maxValues.pace, 150);
    let paceMaxHeight = this.calculateHeight(lap.max_speed, maxValues.pace, 150);
    let paceMinHeight = this.calculateHeight(minimumValues.lapMinPace, maxValues.pace, 150);

    let hrHeight = this.calculateHeight(lap.average_heartrate, maxValues.heartrate, 150);
    let hrMaxHeight = this.calculateHeight(lap.max_heartrate, maxValues.heartrate, 150);
    let hrMinHeight = this.calculateHeight(minimumValues.lapMinHr, maxValues.heartrate, 150);

    this.drawBar(svg, startPos.x, startPos.y - paceHeight, width, this.barHeight, 0.7, '#43b3e6');
    this.drawOffset(svg, startPos.x, startPos.y - paceMaxHeight, width, Math.abs(paceMaxHeight - paceMinHeight), 0.2, '#43b3e6', paceHistorgram);

    let paceItem = {
      startX: startPos.x,
      startY: startPos.y - paceHeight + (this.barHeight / 2),
      endX: startPos.x + width,
      endY: startPos.y - paceHeight + (this.barHeight / 2),
    };

    let heartrateItem;

    if (!drawNextToEachOther) {
      this.drawBar(svg, startPos.x, startPos.y, width, this.barHeight, 0.7, '#ec407a');
      // this.drawOffset(svg, startPos.x, startPos.y, width, this.barHeight, 0.2, '#ec407a');
      heartrateItem = {
        startX: startPos.x,
        startY: startPos.y - (this.barHeight / 2),
        endX: startPos.x + width,
        endY: startPos.y - (this.barHeight / 2),
      };
      startPos.x += (width + offsetLaps);
    } else {
      startPos.x += width + offsetBars;
      this.drawBar(svg, startPos.x, startPos.y - hrHeight, width, this.barHeight, 0.7, '#ec407a');
      this.drawOffset(svg, startPos.x, startPos.y - hrMaxHeight, width,  Math.abs(hrMaxHeight - hrMinHeight), 0.2, '#ec407a', hrHistogram);
      heartrateItem = {
        startX: startPos.x,
        startY: startPos.y - hrHeight + (this.barHeight / 2),
        endX: startPos.x + width,
        endY: startPos.y - hrHeight + (this.barHeight / 2),
      };
      startPos.x += (width + offsetLaps);
    }

    return {
      xVal: startPos.x,
      heartrateItem: heartrateItem,
      paceItem: paceItem,
    };

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

  private drawOffset(svg, xPosition: number, yPosition: number, width: number, height: number, opacity: number, color: string, histogram) {
    let totalItems = 0;
    let steps = height / histogram.length;

    histogram.map(item => {
      totalItems += item.length;
    });

    let leftPoints = [];
    let rightPoints = [];

    histogram.map((item, i) => {
      let percentageOfTotal = getPercentageFromValue(item.length, totalItems);
      let offset = (width / 2) / 100 * percentageOfTotal;

      let xPos = ((xPosition + width) / 2) - offset;
      let yPos = yPosition + (height - (i * steps));

      leftPoints.push([xPos, yPos]);
    });

    histogram.map((item, i) => {
      let percentageOfTotal = getPercentageFromValue(item.length, totalItems);
      let offset = (width / 2) / 100 * percentageOfTotal;

      let xPos = ((xPosition + width) / 2) + offset;
      let yPos = yPosition + (height - (i * steps));

      rightPoints.push([xPos, yPos]);
    });

    let lineGenerator = d3.line();

    rightPoints.reverse();

    svg.append('path')
      .attr('d', lineGenerator([...leftPoints, ...rightPoints]))
      .attr('fill', 'none')
      .attr('stroke', color)
    /*svg.append('rect')
      .attr('x', xPosition)
      .attr('y', yPosition)
      .attr('width', width)
      .attr('height', height)
      .attr('opacity', opacity)
      .attr('fill', color);*/
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
