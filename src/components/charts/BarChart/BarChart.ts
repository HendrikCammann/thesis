/* tslint:disable */
import Vue from 'vue';
import * as d3 from 'd3';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {ActivityModel} from '../../../models/Activity/ActivityModel';
import {setupSvg} from '../../../utils/svgInit/svgInit';
import {BarChartItem, PositionModel} from '../../../models/Chart/ChartModels';
import {getLargerValue, getPercentageFromValue, getSmallerValue} from '../../../utils/numbers/numbers';
import {BarChartSizes, CategoryColors, CategoryOpacity, ZoneColors} from '../../../models/VisualVariableModel';
import {formatDistance} from '../../../utils/format-data';
import {FormatDistanceType} from '../../../models/FormatModel';
import {line} from 'd3';

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
    let offset = 0;
    let chartItems = {
      heartrate: [],
      pace: [],
    };

    let overlap = false;

    let offsetBars = 0;
    let padding = 10;

    let startPos: PositionModel = {
      x: padding,
      y: canvasConstraints.height / 2,
    };

    let maxValues = this.maxZoneValues(data.zones);
    let displayedWidth = this.displayedWidth(canvasConstraints.width, data.laps.length, offsetBars, offset, padding, overlap);
    let pxPerDistance = this.calculatePxPerDistance(displayedWidth, data.base_data.distance, overlap);

    let totalDistanceCovered = 0;
    data.laps.map(lap => {
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

      totalDistanceCovered += lap.distance;

      let drawnItem = this.drawChartItem(svg, lap, pxPerDistance, maxValues, minimumValues, startPos, offsetBars, offset, paceData, hrData, overlap, totalDistanceCovered);
      chartItems.pace.push(drawnItem.paceItem);
      chartItems.heartrate.push(drawnItem.heartrateItem);
      startPos.x = drawnItem.xVal;
    });

    this.connectChartItems(svg, chartItems);
    this.addDivider(svg, 0, startPos.y, startPos.x  + 10,'#E6E6E6');

    startPos.x = padding;

    for (let i = 0; i <= Math.floor(formatDistance(data.base_data.distance, FormatDistanceType.Kilometers)); i++) {
      let offset;
      if (!overlap) {
        offset = this.calculateWidth(FormatDistanceType.Kilometers, pxPerDistance) * 2
      } else {
        offset = this.calculateWidth(FormatDistanceType.Kilometers, pxPerDistance)
      }
      if (i > 0) {
        svg.append('rect')
          .attr('x', startPos.x)
          .attr('y', startPos.y - startPos.y)
          .attr('height', 200)
          .attr('width', 1)
          .attr('opacity', 0.5)
          .attr('fill', '#E6E6E6');
        svg.append('text')
          .attr('x', startPos.x)
          .attr('y', startPos.y + 16)
          .attr('class', 'barChart__scale-label')
          .attr('text-anchor', 'middle')
          .text(i);
      }
      startPos.x += offset;
    }
  }

  /**
   * Connects the Single AvgBars
   * @param svg
   * @param chartItems
   */
  private connectChartItems(svg, chartItems): void {
    let lineGenerator = d3.line().curve(d3.curveCardinal);

    for (let key in chartItems) {
      let color;
      if (key === 'pace') {
        color = '#43b3e6'
      } else {
        color = '#ec407a'
      }

      for (let i = 0; i < chartItems[key].length; i++) {
        if (chartItems[key][i + 1] !== undefined) {
          let points: [number, number][] = [
            [chartItems[key][i].endX, chartItems[key][i].endY],
            [chartItems[key][i + 1].startX, chartItems[key][i + 1].startY],
          ];
          // console.log(points);
          let pathData = lineGenerator(points);
          // console.log(pathData);
          svg.append('path')
            .style('stroke', color)
            .attr('d', pathData);
        }
      }
    }
  }

  /**
   * Draws a single lap with heartrate and pacebar
   * and the offset ranges
   * @param svg
   * @param lap
   * @param {number} pxPerDistance
   * @param maxValues
   * @param minimumValues
   * @param {PositionModel} startPos
   * @param {number} offsetBars
   * @param {number} offsetLaps
   * @param {number[]} paceData
   * @param {number[]} hrData
   * @returns {{xVal: number; heartrateItem: BarChartItem; paceItem: BarChartItem}}
   */
  private drawChartItem(svg, lap, pxPerDistance: number, maxValues, minimumValues, startPos: PositionModel, offsetBars: number, offsetLaps: number, paceData: number[], hrData: number[], overlap: boolean, distanceCovered: number) {
    // CALCULATION OF VISUAL VARIABLES
    let width = this.calculateWidth(lap.distance, pxPerDistance);

    let paceHeight = this.calculateHeight(lap.average_speed, maxValues.pace, 150);
    let paceMaxHeight = this.calculateHeight(lap.max_speed, maxValues.pace, 150);
    let paceMinHeight = this.calculateHeight(minimumValues.lapMinPace, maxValues.pace, 150);

    let hrHeight = this.calculateHeight(lap.average_heartrate, maxValues.heartrate, 150);
    let hrMaxHeight = this.calculateHeight(lap.max_heartrate, maxValues.heartrate, 150);
    let hrMinHeight = this.calculateHeight(minimumValues.lapMinHr, maxValues.heartrate, 150);


    // DRAWING THE PACE VALUES
    // this.drawOffset(svg, startPos.x, startPos.y - paceMaxHeight, width, Math.abs(paceMaxHeight - paceMinHeight), CategoryOpacity.Background, ZoneColors.Pace);
    this.drawMaxValues(svg, startPos.x, startPos.y - paceMaxHeight, width, 1, CategoryOpacity.Active, ZoneColors.Pace);
    this.drawMaxValues(svg, startPos.x, startPos.y - paceMinHeight, width, 1, CategoryOpacity.Active, ZoneColors.Pace);
    // this.drawOffsetRanges(svg, paceData, startPos.x, startPos.y, width, BarChartSizes.OffsetBarHeight, CategoryOpacity.Inactive, ZoneColors.Pace, maxValues.pace);
    this.drawBar(svg, startPos.x, startPos.y - paceHeight, width, BarChartSizes.BarHeight , CategoryOpacity.Full, ZoneColors.Pace);
    let paceItem = new BarChartItem(startPos.x, startPos.y - paceHeight + (BarChartSizes.BarHeight / 2), startPos.x + width,  startPos.y - paceHeight + (BarChartSizes.BarHeight  / 2));

    // ToDo uncomment for overlapping drawing
    // ToDo recalculate DisplayedWidth
    if (!overlap) {
      startPos.x += width + offsetBars;
    }


    // DRAWING THE HEARTRATE VALUES
    // this.drawOffset(svg, startPos.x, startPos.y - hrMaxHeight, width,  Math.abs(hrMaxHeight - hrMinHeight), CategoryOpacity.Background, ZoneColors.Heartrate);
    this.drawMaxValues(svg, startPos.x, startPos.y - hrMaxHeight, width, 1, CategoryOpacity.Hidden, ZoneColors.Heartrate);
    this.drawMaxValues(svg, startPos.x, startPos.y - hrMinHeight, width, 1, CategoryOpacity.Hidden, ZoneColors.Heartrate);
    // this.drawOffsetRanges(svg, hrData, startPos.x, startPos.y, width, BarChartSizes.OffsetBarHeight, CategoryOpacity.Inactive, ZoneColors.Heartrate, maxValues.heartrate);
    this.drawBar(svg, startPos.x, startPos.y - hrHeight, width, BarChartSizes.BarHeight , CategoryOpacity.Hidden, ZoneColors.Heartrate);
    let heartrateItem = new BarChartItem(startPos.x, startPos.y - hrHeight + (BarChartSizes.BarHeight  / 2), startPos.x + width, startPos.y - hrHeight + (BarChartSizes.BarHeight  / 2));

    startPos.x += (width + offsetLaps);

    // DRAW THE DIVIDER
    /*
    svg.append('rect')
      .attr('x', startPos.x - (offsetLaps / 2))
      .attr('y', startPos.y - startPos.y)
      .attr('height', 200)
      .attr('width', 1)
      .attr('opacity', 0.5)
      .attr('fill', '#E6E6E6');
    svg.append('text')
      .attr('x', startPos.x - (offsetLaps / 2))
      .attr('y', startPos.y + 14)
      .attr('class', 'barChart__scale-label')
      .attr('text-anchor', 'middle')
      .text(formatDistance(distanceCovered, FormatDistanceType.Kilometers).toFixed(2));*/


    // RETURN THE DRAWN BARS
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

  /**
   * Adds a fake gradient displaying the different frequencies of zones in the offset
   * @param svg
   * @param {number[]} dataPoints
   * @param {number} xPosition
   * @param {number} yPosition
   * @param {number} width
   * @param {number} height
   * @param {number} opacity
   * @param {string} color
   * @param {number} maxValue
   */
  private drawOffsetRanges(svg, dataPoints: number[], xPosition: number, yPosition: number, width: number, height: number, opacity: number, color: string, maxValue: number): void {
    dataPoints.map(item => {
      let actYPos = this.calculateHeight(item, maxValue, 150);
      this.drawOffset(svg, xPosition, yPosition - actYPos, width, height, opacity, color);
    });
  }

  /**
   * Draws the overall offset range
   * @param svg
   * @param {number} xPosition
   * @param {number} yPosition
   * @param {number} width
   * @param {number} height
   * @param {number} opacity
   * @param {string} color
   */
  private drawOffset(svg, xPosition: number, yPosition: number, width: number, height: number, opacity: number, color: string): void {
    svg.append('rect')
      .attr('x', xPosition)
      .attr('y', yPosition)
      .attr('width', width)
      .attr('height', height)
      .attr('opacity', opacity)
      .attr('fill', color);

    /*let largest = 0;
    let steps = height / histogram.length;

    histogram.map(item => {
      largest = getLargerValue(item.length, largest);
    });

    let leftPoints = [];
    let rightPoints = [];

    histogram.map((item, i) => {
      let percentageOfTotal = getPercentageFromValue(item.length, largest);
      let offset = (width / 2) / 100 * percentageOfTotal;

      let xPosLeft = ((xPosition + (width / 2) - offset));
      let xPosRight = ((xPosition + (width / 2) + offset));
      let yPos = yPosition + height - ((i + 1) * steps);

      leftPoints.push([xPosLeft, yPos]);
      rightPoints.push([xPosRight, yPos]);

    });

    let lineGenerator = d3.line().curve(d3.curveLinearClosed);

    rightPoints.reverse();

    svg.append('path')
      .attr('d', lineGenerator([...leftPoints, ...rightPoints]))
      .attr('fill', color)
      .attr('opacity', opacity)
      .attr('stroke', color);*/
  }

  private drawMaxValues(svg, xPosition: number, yPosition: number, width: number, height: number, opacity: number, color: string): void {
    svg.append('rect')
      .attr('x', xPosition)
      .attr('y', yPosition)
      .attr('width', width)
      .attr('height', height)
      .attr('opacity', opacity)
      .attr('fill', color);

    /*let largest = 0;
    let steps = height / histogram.length;

    histogram.map(item => {
      largest = getLargerValue(item.length, largest);
    });

    let leftPoints = [];
    let rightPoints = [];

    histogram.map((item, i) => {
      let percentageOfTotal = getPercentageFromValue(item.length, largest);
      let offset = (width / 2) / 100 * percentageOfTotal;

      let xPosLeft = ((xPosition + (width / 2) - offset));
      let xPosRight = ((xPosition + (width / 2) + offset));
      let yPos = yPosition + height - ((i + 1) * steps);

      leftPoints.push([xPosLeft, yPos]);
      rightPoints.push([xPosRight, yPos]);

    });

    let lineGenerator = d3.line().curve(d3.curveLinearClosed);

    rightPoints.reverse();

    svg.append('path')
      .attr('d', lineGenerator([...leftPoints, ...rightPoints]))
      .attr('fill', color)
      .attr('opacity', opacity)
      .attr('stroke', color);*/
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
  private drawBar(svg, xPosition: number, yPosition: number, width: number, height: number, opacity: number, color: string): void {
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
  private calculateHeight(value: number, indexValue: number, indexHeight: number): number {
    let percentage = (100 / indexValue * value) / 100;
    return indexHeight * percentage;
  }

  /**
   * Calculates the width of every bar
   * @param {number} distance
   * @param {number} pxPerDistance
   * @returns {number}
   */
  private calculateWidth(distance: number, pxPerDistance: number): number {
    return distance * pxPerDistance;
  }

  /**
   * Calculates how many pixels display one meter
   * @param {number} displayedWidth
   * @param {number} totalDistance
   * @param {boolean} drawNextToEachOther
   * @returns {number}
   */
  private calculatePxPerDistance(displayedWidth: number, totalDistance: number, overlap: boolean): number {
    if (overlap) {
      return displayedWidth / totalDistance;
    } else {
      return displayedWidth / (totalDistance * 2);
    }
  };

  /**
   * Calculates the pixels which are aviable for the bars to be drawn
   * @param {number} canvasWidth
   * @param {number} amountLaps
   * @param {number} offsetBars
   * @param {number} offsetLaps
   * @param {number} padding
   * @returns {number}
   */
  private displayedWidth(canvasWidth: number, amountLaps: number, offsetBars: number, offsetLaps: number, padding: number, overlap: boolean): number {
      if (overlap) {
        return (canvasWidth - (((amountLaps - 1) * offsetLaps) + (padding * 2)));
      } else {
        return (canvasWidth - ((amountLaps * offsetBars) + ((amountLaps - 1) * offsetLaps) + (padding * 2)));
      }
  }

  mounted() {
    this.barChart('#' + this.root, {width: 1140, height: 400, marginBottom: 20, canvasOffset: 10}, this.activity);
  }
}
