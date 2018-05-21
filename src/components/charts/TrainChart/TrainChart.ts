import Vue from 'vue';
import * as d3 from 'd3';

import {Component, Prop, Watch} from 'vue-property-decorator';
import {setupSvg} from '../../../utils/svgInit/svgInit';
import {LoadingStatus, loadingStatus} from '../../../models/App/AppStatus';
import {ClusterWrapper} from '../../../models/State/StateModel';
import {getPercentageFromValue} from '../../../utils/numbers/numbers';
import {PositionModel} from '../../../models/Chart/ChartModels';
import {getKeys} from '../../../utils/array-helper';
import {formatDistance} from '../../../utils/format-data';
import {FormatDistanceType} from '../../../models/FormatModel';
import {CategoryColors} from '../../../models/VisualVariableModel';

@Component({
  template: require('./trainChart.html'),
})
export class TrainChart extends Vue {
  @Prop()
  root: string;

  @Prop()
  preparation: string;

  @Prop()
  loadingStatus: LoadingStatus;

  private width = 300;
  private height = 4000;
  private padding = 8;
  private itemHeight = 150;
  private weekHeight = this.itemHeight - (2 * this.padding);
  private barWidth = 15;

  private largestValue = 62481;

  @Watch('loadingStatus.activities')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      let data = this.getData(this.preparation);
      this.trainChart(this.root, data);
    }
  }

  private getData(preparation: string): ClusterWrapper {
    return this.$store.state.sortedLists[preparation];
  }

  private trainChart(root: string, data: ClusterWrapper) {
    let svg = setupSvg('#' + root, this.width, this.height);
    let barItems = this.drawFoldedChart(svg, data.byWeeks, this.weekHeight, this.padding, this.largestValue);
    this.drawFoldedConnections(svg, barItems);
    this.drawFoldedWeekChanges(svg, barItems);
    this.drawFoldedBars(svg, barItems);
  }


  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////// FOLDED //////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  private drawFoldedChart(svg: any, data: any, weekHeight: number, padding: number, largestValue: number): any {
    let position: PositionModel = {
      x: this.width / 2,
      y: 15,
    };
    let positionDivider: PositionModel = {
      x: 0,
      y: 15,
    };
    let barItems = [];

    let index = 0;
    let duration = getKeys(data);
    duration = duration.length;

    for (let key in data) {
      this.drawDivider(svg, this.width, (duration - index), positionDivider, '#F3F3F3');
      position.y += padding;
      positionDivider.y += padding;

      let barLength = this.barLength(weekHeight, largestValue, data[key].stats.distance);
      let distance = formatDistance(data[key].stats.distance, FormatDistanceType.Kilometers).toFixed(0);
      let barItem = this.calculateBar(svg, barLength, position, distance, CategoryColors.Default);
      barItems.push(barItem);

      position.y += weekHeight;
      positionDivider.y += weekHeight;
      position.y += padding;
      positionDivider.y += padding;

      index++;
    }

    return barItems;
  }

  private drawFoldedConnections(svg: any, barItems: any) {
    let padding = 4;
    for (let i = 0; i < barItems.length; i++) {
      if (this.checkIfBarExists(barItems[i]) && i < barItems.length - 1) {
        if (this.checkIfBarExists(barItems[i + 1])) {
          let position: PositionModel = {
            x: barItems[i].xStart,
            y: barItems[i].yEnd + 4,
          };

          let length = Math.abs(barItems[i].yEnd - barItems[i + 1].yStart) - (2 * padding);
          let barWidth = barItems[i].width;

          this.drawLineConnection(svg, position, length, barWidth, CategoryColors.Default);
        }
      }
    }
  }

  private drawFoldedWeekChanges(svg: any, barItems: any) {
    for (let i = 0; i < barItems.length; i++) {
      if (this.checkIfBarExists(barItems[i]) && i < barItems.length - 1) {
        if (this.checkIfBarExists(barItems[i + 1])) {
          let position: PositionModel = {
            x: barItems[i].xStart + (this.barWidth / 2),
            y: (barItems[i].yStart + barItems[i + 1].yStart) / 2
          };

          let isLeft = barItems[i].distance < barItems[i + 1].distance;
          let totalDifference = barItems[i].distance - barItems[i + 1].distance;
          let percentualDifference: number;

          if (barItems[i].distance > barItems[i + 1].distance) {
            percentualDifference = getPercentageFromValue(barItems[i].distance, barItems[i + 1].distance);
          } else {
            percentualDifference = getPercentageFromValue(barItems[i + 1].distance, barItems[i].distance);
          }

          let legPositions = [
            {
              x: barItems[i].xStart,
              y: barItems[i].yStart,
            },
            {
              x: barItems[i + 1].xStart,
              y: barItems[i + 1].yStart,
            }
          ];

          this.drawChangeArc(svg, position, legPositions, this.itemHeight / 2, 6, totalDifference, percentualDifference, isLeft);
        }
      }
    }
  }

  private drawFoldedBars(svg: any, barItems: any) {
    for (let i = 0; i < barItems.length; i++) {
      if (this.checkIfBarExists(barItems[i])) {
        let position: PositionModel = {
          x: barItems[i].xStart,
          y: barItems[i].yStart,
        };

        let width = barItems[i].width;
        let height = barItems[i].length;
        let distance = barItems[i].distance;

        this.drawBar(svg, position, width, height, CategoryColors.Default, distance);
      }
    }
  }


  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////// GENERAL /////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  /**
   * draws Bar with km Label
   * @param svg
   * @param {number} barLength
   * @param {PositionModel} position
   * @param {number | string} distance
   * @param {CategoryColors} color
   * @returns {{xStart: number; yStart: number; xEnd: number; yEnd: number; width: number; length: number}}
   */
  private calculateBar(svg: any, barLength: number, position: PositionModel, distance: number | string, color: CategoryColors) {
    let width = this.barWidth;
    return {
      xStart: position.x,
      yStart: position.y,
      xEnd: position.x,
      yEnd: position.y + barLength,
      width: width,
      length: barLength,
      distance: distance,
    };
  }

  /**
   * calculates BarLength of a single bar
   * @param {number} weekHeight
   * @param {number} largestValue
   * @param {number} distance
   * @returns {number}
   */
  private barLength(weekHeight: number, largestValue: number, distance: number): number {
    let percentage = getPercentageFromValue(distance, largestValue) / 100;
    return weekHeight * percentage;
  }

  private checkIfBarExists(barItem: any) {
    return (barItem.length !== undefined && barItem.length > 0);
  }

  /**
   * draws Divider with weekcount
   * @param svg
   * @param {number} width
   * @param {number} weekIndex
   * @param {PositionModel} position
   * @param {string} color
   */
  private drawDivider(svg: any, width: number, weekIndex: number, position: PositionModel, color: string) {
    svg.append('text')
      .attr('x', position.x)
      .attr('y', position.y + 7)
      .attr('fill', '#D9D9D9')
      .attr('text-anchor', 'left')
      .text(weekIndex);

    svg.append('rect')
      .attr('x', position.x + this.barWidth)
      .attr('y', position.y)
      .attr('height', 1)
      .attr('width', width - this.barWidth)
      .attr('fill', color);
  }

  private drawLineConnection(svg: any, position: PositionModel, length: number, barWidth: number, color: CategoryColors) {
    let width = 3;
    svg.append('rect')
      .attr('x', position.x + (barWidth / 2) - (width / 2))
      .attr('y', position.y)
      .attr('rx', width / 2)
      .attr('ry', width / 2)
      .attr('height', length)
      .attr('width', width)
      .attr('fill', color)
      .attr('opacity', 1);
  }

  private drawChangeArc(svg: any, position: PositionModel, legPositions: any, radius: number, height: number, totalDifference: number, percentualDifference: number, left: boolean) {
    let arc = d3.arc();
    let startAngle = -Math.PI * 2;
    let endAngle = -Math.PI;
    let color = '#7ED321';
    let textOffset = 25;
    let textAnchor = 'left';

    let arcOffsetX = Math.round(percentualDifference / 5);

    let x = position.x;
    let y = position.y + (height / 2);

    if (left) {
      startAngle *= -1;
      endAngle *= -1;
      color = '#D0021B';
      textOffset *= -1;
      textOffset -= 35;
      textAnchor = 'right';
      x -= arcOffsetX;
    } else {
      x += arcOffsetX;
    }

    svg.append('path')
      .attr('transform', 'translate(' + [x, y] + ')')
      .attr('d', arc({
        innerRadius: radius - (height / 2),
        outerRadius: radius + (height / 2),
        startAngle: startAngle,
        endAngle: endAngle,
      }))
      .attr('fill', color)
      .attr('opacity', 0.1);

    if (left) {
      legPositions.forEach(item => {
        svg.append('rect')
          .attr('x', item.x + (this.barWidth / 2) - arcOffsetX)
          .attr('y', item.y)
          .attr('fill', color)
          .attr('width', arcOffsetX)
          .attr('opacity', 0.1)
          .attr('height', height);
      });
      console.log(percentualDifference);
      x += arcOffsetX;
    } else {
      legPositions.forEach(item => {
        svg.append('rect')
          .attr('x', item.x + (this.barWidth / 2))
          .attr('y', item.y)
          .attr('fill', color)
          .attr('width', arcOffsetX)
          .attr('opacity', 0.1)
          .attr('height', height);
      });
      x -= arcOffsetX;
    }

    svg.append('text')
      .attr('x', x + textOffset)
      .attr('y', y + 7)
      .attr('fill', color)
      .attr('text-anchor', textAnchor)
      .text(totalDifference + 'km');

  }

  private drawBar(svg: any, position: PositionModel, width: number, height: number, color: CategoryColors, distance: string | number) {
    svg.append('rect')
      .attr('x', position.x)
      .attr('y', position.y)
      .attr('rx', width / 2)
      .attr('ry', width / 2)
      .attr('height', height)
      .attr('width', width)
      .attr('fill', color)
      .attr('opacity', 1);

    svg.append('text')
      .attr('x', position.x + width + 4)
      .attr('y', position.y + 14)
      .attr('fill', color)
      .attr('text-anchor', 'right')
      .text(distance);
  }


  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////// LIFECYCLE ///////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      let data = this.getData(this.preparation);
      this.trainChart(this.root, data);
    }
  }
}
