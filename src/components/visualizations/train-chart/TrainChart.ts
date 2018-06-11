import Vue from 'vue';
import * as d3 from 'd3';

import {Component, Prop, Watch} from 'vue-property-decorator';
import {setupSvg} from '../../../utils/svgInit/svgInit';
import {LoadingStatus, loadingStatus} from '../../../models/App/AppStatus';
import {ClusterWrapper} from '../../../models/State/StateModel';
import {getLargerValue, getPercentageFromValue} from '../../../utils/numbers/numbers';
import {PositionModel} from '../../../models/Chart/ChartModels';
import {getKeys} from '../../../utils/array-helper';
import {formatDistance} from '../../../utils/format-data';
import {FormatDistanceType, FormatDurationType} from '../../../models/FormatModel';
import {CategoryColors, CategoryOpacity, Colors} from '../../../models/VisualVariableModel';
import {calculateCategoryOpacity, getCategoryColor} from '../../../utils/calculateVisualVariables';
import {DisplayType, RunType} from '../../../store/state';
import {ActivityClusterTypeCountModel} from '../../../models/Activity/ActivityClusterModel';
import {MutationTypes} from '../../../store/mutation-types';
import {formatSecondsToDuration} from '../../../utils/time/time-formatter';

@Component({
  template: require('./trainChart.html'),
})
export class TrainChart extends Vue {
  @Prop()
  root: string;

  @Prop()
  anchors: string[];

  @Prop()
  preparation: string;

  @Prop()
  loadingStatus: LoadingStatus;

  @Prop()
  selectedRunType: RunType;

  @Prop()
  showEverything: boolean;

  @Prop()
  clustering: string;

  @Prop()
  showDate: boolean;

  @Prop()
  selectedDisplayType: DisplayType;

  @Prop()
  isDual: boolean;


  private type = DisplayType.Duration;

  // private selectedRunType: RunType = RunType.All;

  private width = 309;
  private height: number;
  private padding = 8;
  private itemHeight = 200;
  private weekHeight = this.itemHeight - (2 * this.padding);
  private barWidth = 16;

  private largestValue: number;


  @Watch('loadingStatus.activities')
  @Watch('selectedRunType')
  @Watch('selectedDisplayType')
  @Watch('showEverything')
  @Watch('preparation')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      if (this.isDual) {
        this.width = 275;
      }
      this.height = this.calculateSvgHeight(this.anchors);
      this.largestValue = this.getMaxValue(this.anchors);
      let data = this.getData(this.preparation);
      this.trainChart(this.root, data);
    }
  }


  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////// CALCULATIONS ////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  /**
   *
   * @param {string[]} anchors
   * @returns {number}
   */
  private calculateSvgHeight(anchors: string[]): number {
    let length = 0;
    anchors.forEach(anchor => {
      let data = this.$store.state.sortedLists[anchor];
      data = data[this.clustering];
      let keys = getKeys(data);
      if (anchor === this.preparation) {
        length = keys.length;
      }
    });
    return length * this.itemHeight;
  }

  /**
   * get maximal Distance from all data
   * @param {string[]} anchors
   * @returns {number}
   */
  private getMaxValue(anchors: string[]) {
    let maxValue = 0;
    let longestPreparation = 0;
    anchors.forEach(anchor => {
      let data = this.$store.state.sortedLists[anchor];
      data = data[this.clustering];
      let keys = getKeys(data);
      longestPreparation = getLargerValue(keys.length, longestPreparation);
      for (let key in data) {
        switch (this.selectedDisplayType) {
          case DisplayType.Distance:
            maxValue = getLargerValue(data[key].stats.distance, maxValue);
            break;
          case DisplayType.Duration:
            maxValue = getLargerValue(data[key].stats.time, maxValue);
            break;
          case DisplayType.Intensity:
            maxValue = getLargerValue(data[key].stats.time, maxValue);
            break;
        }
      }
    });
    return maxValue;
  }

  /**
   * get the Cluster from store
   * @param {string} preparation
   * @returns {ClusterWrapper}
   */
  private getData(preparation: string): ClusterWrapper {
    return this.$store.state.sortedLists[preparation];
  }


  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////// MAIN ////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  /**
   * wraps all functions and checks if folded or unfolded
   * @param {string} root
   * @param {ClusterWrapper} data
   */
  private trainChart(root: string, data: ClusterWrapper) {
    let svg = setupSvg('#' + root, this.width, this.height);
    if (this.showEverything) {
      let barItems = this.calculateFoldedChart(svg, data[this.clustering], this.weekHeight, this.padding, this.largestValue);
      this.drawFoldedConnections(svg, barItems);
      this.drawFoldedWeekChanges(svg, barItems);
      this.drawFoldedBars(svg, barItems);
      // this.drawFoldedCheckboxes(svg, barItems);
    } else {
      let barItems = this.calculateUnfoldedChart(svg, data[this.clustering], this.weekHeight, this.padding, this.largestValue);
      this.drawUnfoldedConnections(svg, barItems);
      this.drawUnfoldedBars(svg, barItems);
    }
  }


  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////// UNFOLDED ////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  /**
   * calculates the Bar positions
   * @param svg
   * @param data
   * @param {number} weekHeight
   * @param {number} padding
   * @param {number} largestValue
   * @returns {any}
   */
  private calculateUnfoldedChart(svg: any, data: any, weekHeight: number, padding: number, largestValue: number): any {
    let position: PositionModel = {
      x: this.width / 6,
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

      let weekBars = [];
      for (let anchor in data[key].stats.typeCount) {
        let barLength;
        let label;

        switch (this.selectedDisplayType) {
          case DisplayType.Distance:
            barLength = this.barLength(weekHeight, largestValue, data[key].stats.typeCount[anchor].distance);
            label = formatDistance(data[key].stats.typeCount[anchor].distance, FormatDistanceType.Kilometers).toFixed(0);
            break;
          case DisplayType.Duration:
            barLength = this.barLength(weekHeight, largestValue, data[key].stats.typeCount[anchor].duration);
            label = formatSecondsToDuration(data[key].stats.typeCount[anchor].duration, FormatDurationType.Dynamic).all;
            break;
          case DisplayType.Intensity:
            barLength = this.barLength(weekHeight, largestValue, data[key].stats.typeCount[anchor].duration);
            label = 'int';
            break;
        }
        let color = CategoryColors.Default;
        if (data[key].stats.typeCount[anchor].type !== null) {
          color = getCategoryColor(data[key].stats.typeCount[anchor].type);
        }

        let barItem = this.calculateBar(barLength, position, label, color, data[key].stats.typeCount[anchor].type, null);
        weekBars.push(barItem);
        position.x += (this.width / 6);
      }
      barItems.push(weekBars);

      position.x = this.width / 6;
      position.y += weekHeight;
      positionDivider.y += weekHeight;
      position.y += padding;
      positionDivider.y += padding;

      index++;
    }

    return barItems;
  }

  /**
   * applies the Connections to the svg
   * @param svg
   * @param barItems
   */
  private drawUnfoldedConnections(svg: any, barItems: any) {
    let padding = 4;
    for (let i = 0; i < barItems.length; i++) {
      for (let j = 0; j < barItems[i].length; j++) {
        if (this.checkIfBarExists(barItems[i][j]) && i < barItems.length - 1) {
          let opacity = calculateCategoryOpacity(this.selectedRunType, barItems[i][j].type);
          if (this.checkIfBarExists(barItems[i + 1][j])) {
            let position: PositionModel = {
              x: barItems[i][j].xStart,
              y: barItems[i][j].yEnd + 4,
            };

            let length = Math.abs(barItems[i][j].yEnd - barItems[i + 1][j].yStart) - (2 * padding);
            let barWidth = barItems[i][j].width;

            this.drawLineConnection(svg, position, length, barWidth, barItems[i][j].color, opacity);
          } else {
            for (let k = (i + 1); k < barItems.length; k++) {
              if (this.checkIfBarExists(barItems[k][j])) {
                let position: PositionModel = {
                  x: barItems[i][j].xStart,
                  y: barItems[i][j].yEnd + 4,
                };

                let length = Math.abs(barItems[i][j].yEnd - barItems[k][j].yStart) - (2 * padding);
                let barWidth = barItems[i][j].width;

                this.drawDotConnection(svg, position, length, barWidth, barItems[i][j].color, opacity);
                break;
              }
            }
          }
        }
      }
    }
  }

  /**
   * applies the Bars to the svg
   * @param svg
   * @param barItems
   */
  private drawUnfoldedBars(svg: any, barItems: any) {
    for (let i = 0; i < barItems.length; i++) {
      for (let j = 0; j < barItems[i].length; j++) {
        if (this.checkIfBarExists(barItems[i][j])) {
          let position: PositionModel = {
            x: barItems[i][j].xStart,
            y: barItems[i][j].yStart,
          };

          let width = barItems[i][j].width;
          let height = barItems[i][j].length;
          let distance = barItems[i][j].distance;
          let color = barItems[i][j].color;
          let opacity = calculateCategoryOpacity(this.selectedRunType, barItems[i][j].type);

          this.drawBar(svg, position, width, height, color, distance, opacity, false);
        }
      }
    }
  }


  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////// FOLDED //////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  /**
   * calculates the Bar positions
   * @param svg
   * @param data
   * @param {number} weekHeight
   * @param {number} padding
   * @param {number} largestValue
   * @returns {any}
   */
  private calculateFoldedChart(svg: any, data: any, weekHeight: number, padding: number, largestValue: number): any {
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

      let barLength;
      let label;
      let percentages;

      switch (this.selectedDisplayType) {
        case DisplayType.Distance:
          barLength = this.barLength(weekHeight, largestValue, data[key].stats.distance);
          label = formatDistance(data[key].stats.distance, FormatDistanceType.Kilometers).toFixed(0);
          percentages = this.calculatePercentageOfTotal(data[key].stats.typeCount, data[key].stats.distance);
          break;
        case DisplayType.Duration:
          barLength = this.barLength(weekHeight, largestValue, data[key].stats.time);
          label = formatSecondsToDuration(data[key].stats.time, FormatDurationType.Dynamic).all;
          percentages = this.calculatePercentageOfTotal(data[key].stats.typeCount, data[key].stats.time);
          break;
        case DisplayType.Intensity:
          barLength = this.barLength(weekHeight, largestValue, data[key].stats.time);
          label = 'int';
          percentages = this.calculatePercentageOfTotal(data[key].stats.typeCount, data[key].stats.time);
          break;
      }

      let barItem = this.calculateBar(barLength, position, label, CategoryColors.Default, RunType.All, percentages);
      barItems.push(barItem);

      position.y += weekHeight;
      positionDivider.y += weekHeight;
      position.y += padding;
      positionDivider.y += padding;

      index++;
    }

    return barItems;
  }

  /**
   * applies the Connections to the svg
   * @param svg
   * @param barItems
   */
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
          let opacity = CategoryOpacity.Full;

          if (this.selectedRunType !== RunType.All) {
            opacity = CategoryOpacity.Inactive;
          }

          this.drawLineConnection(svg, position, length, barWidth, CategoryColors.Default, opacity);
        } else {
          for (let k = (i + 1); k < barItems.length; k++) {
            if (this.checkIfBarExists(barItems[k])) {
              let position: PositionModel = {
                x: barItems[i].xStart,
                y: barItems[i].yEnd + 4,
              };

              let length = Math.abs(barItems[i].yEnd - barItems[k].yStart) - (2 * padding);
              let barWidth = barItems[i].width;
              let opacity = CategoryOpacity.Full;

              if (this.selectedRunType !== RunType.All) {
                opacity = CategoryOpacity.Inactive;
              }

              this.drawDotConnection(svg, position, length, barWidth, barItems[i].color, opacity);
              break;
            }
          }
        }
      }
    }
  }

  /**
   * applies the Arcs to the svg
   * @param svg
   * @param barItems
   */
  private drawFoldedWeekChanges(svg: any, barItems: any) {
    for (let i = 0; i < barItems.length; i++) {
      if (this.checkIfBarExists(barItems[i]) && i < barItems.length - 1) {
        if (this.checkIfBarExists(barItems[i + 1])) {
          if (this.selectedRunType === RunType.All) {
            let midBarOne = ((barItems[i].yStart + barItems[i].yEnd) / 2 ) - 4;
            let midBarTwo = ((barItems[i + 1].yStart + barItems[i + 1].yEnd) / 2) - 4;

            let position: PositionModel = {
              x: barItems[i].xStart + (this.barWidth / 2),
              y: (midBarOne + midBarTwo) / 2
            };

            let radius = Math.abs(midBarOne - midBarTwo) / 2;

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
                y: midBarOne,
              },
              {
                x: barItems[i + 1].xStart,
                y: midBarTwo,
              }
            ];

            this.drawChangeArc(svg, position, legPositions, radius, 6, totalDifference, percentualDifference, isLeft);
          } else {
            let bar = barItems[i].percentages.find(item => {
              return item.type === this.selectedRunType;
            });

            if (bar !== undefined && bar.percentage > 0) {
              let nextBar = barItems[i + 1].percentages.find(item => {
                return item.type === this.selectedRunType;
              });

              if (nextBar !== undefined && nextBar.percentage > 0) {
                let overlayLengthBarOne = bar.distance;
                let overlayLengthBarTwo = nextBar.distance;
                if (this.selectedDisplayType === DisplayType.Duration) {
                  overlayLengthBarOne = overlayLengthBarOne / 1000;
                  overlayLengthBarTwo = overlayLengthBarTwo / 1000;
                }
                let midBarOne = ((barItems[i].yStart + (barItems[i].yStart + overlayLengthBarOne)) / 2);
                let midBarTwo = ((barItems[i + 1].yStart + (barItems[i + 1].yStart + overlayLengthBarTwo)) / 2);

                let radius = Math.abs(midBarOne - midBarTwo) / 2;

                let position: PositionModel = {
                  x: barItems[i].xStart + (this.barWidth / 2),
                  y: (midBarOne + midBarTwo) / 2
                };

                let isLeft = bar.distance < nextBar.distance;
                let totalDifference = (bar.distance - nextBar.distance).toFixed(0);
                let percentualDifference: number;

                if (bar.distance > nextBar.distance) {
                  percentualDifference = getPercentageFromValue(bar.distance, nextBar.distance);
                } else {
                  percentualDifference = getPercentageFromValue(bar.distance, nextBar.distance);
                }

                let legPositions = [
                  {
                    x: barItems[i].xStart,
                    y: midBarOne,
                  },
                  {
                    x: barItems[i + 1].xStart,
                    y: midBarTwo,
                  }
                ];

                this.drawChangeArc(svg, position, legPositions, radius, 6, totalDifference, percentualDifference, isLeft);
              }
            }
          }
        }
      }
    }
  }

  /**
   * applies the Bars to the svg
   * @param svg
   * @param barItems
   */
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

        if (this.selectedRunType !== RunType.All && this.showEverything) {
          this.drawBar(svg, position, width, height, barItems[i].color, distance, CategoryOpacity.Inactive, true);
          let bar = barItems[i].percentages.find(item => {
            return item.type === this.selectedRunType;
          });
          if (bar !== undefined) {
            let overlayHeight = height * (bar.percentage / 100);
            let overlayDistance;
            switch (this.selectedDisplayType) {
              case DisplayType.Distance:
                overlayDistance = bar.distance.toFixed(0);
                break;
              case DisplayType.Duration:
                overlayDistance = bar.distance.toFixed(0);
                break;
              case DisplayType.Intensity:
                overlayDistance = bar.distance.toFixed(0);
                break;
            }
            let color = getCategoryColor(bar.type);
            this.drawBar(svg, position, width, overlayHeight, color, overlayDistance, CategoryOpacity.Full, false);
          }
        } else {
          this.drawBar(svg, position, width, height, barItems[i].color, distance, CategoryOpacity.Full, false);
        }
      }
    }
  }


  private drawFoldedCheckboxes(svg: any, barItems: any) {
    for (let i = 0; i < barItems.length; i++) {
      if (this.checkIfBarExists(barItems[i])) {
        let position: PositionModel = {
          x: this.width - 16,
          y: barItems[i].yStart,
        };

        let id = 'checkbox_' + i + '_' + this.preparation;

        this.drawCheckbox(svg, position, 8, id, barItems[i], this.preparation);
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
  private calculateBar(barLength: number, position: PositionModel, distance: number | string, color: CategoryColors, type: RunType, percentages: any) {
    let width = this.barWidth;
    if (barLength < width && barLength !== 0) {
      barLength = width;
    }
    return {
      xStart: position.x,
      yStart: position.y,
      xEnd: position.x,
      yEnd: position.y + barLength,
      width: width,
      length: barLength,
      distance: distance,
      type: type,
      color: color,
      percentages: percentages,
    };
  }

  /**
   *
   * @param {ActivityClusterTypeCountModel} typeCount
   * @param {number} distance
   * @returns {any[]}
   */
  private calculatePercentageOfTotal(typeCount: ActivityClusterTypeCountModel, distance: number) {
    let percentages = [];
    for (let key in typeCount) {
      let item;
      switch (this.selectedDisplayType) {
        case DisplayType.Distance:
          item = {
            percentage: getPercentageFromValue(typeCount[key].distance, distance),
            distance: formatDistance(typeCount[key].distance, FormatDistanceType.Kilometers),
            type: typeCount[key].type,
          };
          break;
        case DisplayType.Duration:
          item = {
            percentage: getPercentageFromValue(typeCount[key].duration, distance),
            distance: typeCount[key].duration,
            type: typeCount[key].type,
          };
          break;
        case DisplayType.Intensity:
          item = {
            percentage: getPercentageFromValue(typeCount[key].duration, distance),
            distance: typeCount[key].duration,
            type: typeCount[key].type,
          };
          break;
      }

      percentages.push(item);
    }
    return percentages;
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

  /**
   * checks if Bar exists and has to be drawn
   * @param barItem
   * @returns {boolean}
   */
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
    if (this.showDate) {
      svg.append('text')
        .attr('class', 'trainChart__divider-label')
        .attr('x', position.x)
        .attr('y', position.y + 6)
        .attr('fill', '#D9D9D9')
        .attr('text-anchor', 'left')
        .text(weekIndex);

      svg.append('rect')
        .attr('x', position.x + this.barWidth)
        .attr('y', position.y)
        .attr('height', 1)
        .attr('width', width - this.barWidth)
        .attr('fill', color);
    } else {
      svg.append('rect')
        .attr('x', position.x)
        .attr('y', position.y)
        .attr('height', 1)
        .attr('width', width)
        .attr('fill', color);
    }
  }

  /**
   * connects the single Bars
   * @param svg
   * @param {PositionModel} position
   * @param {number} length
   * @param {number} barWidth
   * @param {CategoryColors} color
   */
  private drawLineConnection(svg: any, position: PositionModel, length: number, barWidth: number, color: CategoryColors, opacity: CategoryOpacity) {
    let width = 3;
    svg.append('rect')
      .attr('x', position.x + (barWidth / 2) - (width / 2))
      .attr('y', position.y)
      .attr('rx', width / 2)
      .attr('ry', width / 2)
      .attr('height', length)
      .attr('width', width)
      .attr('fill', color)
      .attr('opacity', opacity);
  }

  /**
   * connects the single Bars when not more than one week difference
   * @param svg
   * @param {PositionModel} position
   * @param {number} length
   * @param {number} barWidth
   * @param {CategoryColors} color
   */
  private drawDotConnection(svg: any, position: PositionModel, length: number, barWidth: number, color: CategoryColors, opacity: CategoryOpacity) {
    let width = 3;
    let margin = 4;
    let i = 0;
    position.y += (width / 2);
    while ((i + width) < length) {
      svg.append('circle')
        .attr('cx', position.x + (barWidth / 2))
        .attr('cy', position.y + 2)
        .attr('r', 1.5)
        .attr('fill', color)
        .attr('opacity', opacity);
      position.y += (width + margin);
      i += (width + margin);
    }
  }

  /**
   * draws Arcs between the Bars
   * @param svg
   * @param {PositionModel} position
   * @param legPositions
   * @param {number} radius
   * @param {number} height
   * @param totalDifference
   * @param {number} percentualDifference
   * @param {boolean} left
   */
  private drawChangeArc(svg: any, position: PositionModel, legPositions: any, radius: number, height: number, totalDifference: any, percentualDifference: number, left: boolean) {
    let arc = d3.arc();
    let startAngle = -Math.PI * 2;
    let endAngle = -Math.PI;
    let color = '#7ED321';
    let textOffset = radius;
    let textAnchor = 'middle';

    let trianglePos = position.x + this.barWidth;

    // let arcOffsetX = Math.round(percentualDifference / 8);
    let arcOffsetX = 15;

    let x = position.x;
    let y = position.y + (height / 2);

    if (left) {
      startAngle *= -1;
      endAngle *= -1;
      color = '#D0021B';
      textOffset *= -1;
      textOffset -= arcOffsetX;
      x -= arcOffsetX;
      trianglePos = position.x;
    } else {
      x += arcOffsetX;
      textOffset += arcOffsetX;
      totalDifference = '+' + totalDifference;
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

    if (this.selectedDisplayType === DisplayType.Distance) {
      svg.append('text')
        .attr('class', 'trainChart__arc-label')
        .attr('x', x + textOffset)
        .attr('y', y + 5)
        .attr('fill', color)
        .attr('text-anchor', textAnchor)
        .text(totalDifference + 'km');
    } else {
      svg.append('text')
        .attr('class', 'trainChart__arc-label')
        .attr('x', x + textOffset)
        .attr('y', y + 5)
        .attr('fill', color)
        .attr('text-anchor', textAnchor)
        .text(totalDifference);
    }

  }

  /**
   * draws Bar with label
   * @param svg
   * @param {PositionModel} position
   * @param {number} width
   * @param {number} height
   * @param {CategoryColors} color
   * @param {string | number} distance
   */
  private drawBar(svg: any, position: PositionModel, width: number, height: number, color: CategoryColors, distance: string | number, opacity: number, hideLabel: boolean) {
    svg.append('rect')
      .attr('x', position.x)
      .attr('y', position.y)
      .attr('rx', width / 2)
      .attr('ry', width / 2)
      .attr('height', height)
      .attr('width', width)
      .attr('fill', color)
      .attr('opacity', opacity);

    if (!hideLabel) {
      if (this.selectedDisplayType === DisplayType.Distance) {
        svg.append('text')
          .attr('class', 'trainChart__bar-label')
          .attr('x', position.x + width + 4)
          .attr('y', position.y + 14)
          .attr('fill', color)
          .attr('text-anchor', 'right')
          .attr('opacity', opacity)
          .text(distance + 'km');
      } else {
        svg.append('text')
          .attr('class', 'trainChart__bar-label')
          .attr('x', position.x + width + 4)
          .attr('y', position.y + 14)
          .attr('fill', color)
          .attr('text-anchor', 'right')
          .attr('opacity', opacity)
          .text(distance);
      }

      /*svg.append('text')
        .attr('x', position.x + width + 4)
        .attr('y', position.y + 30)
        .attr('fill', color)
        .attr('text-anchor', 'right')
        .attr('opacity', opacity)
        .text('km');*/
    }
  }

  public drawCheckbox(svg: any, position: PositionModel, radius: number, id: string, barItem: any, preparation: string) {
    svg.append('circle')
      .attr('cx', position.x - radius)
      .attr('cy', position.y + radius)
      .attr('r', radius)
      .attr('stroke', Colors.LightGray)
      .attr('id', id)
      .attr('class', 'trainChart__checkbox')
      .style('fill', Colors.White)
      .on('click', () => {
        let item = document.getElementById(id);
        let week = barItem;
        if (item.style.fill === 'rgb(69, 69, 69)') {
          item.style.fill = Colors.White;
          this.$store.dispatch(MutationTypes.DESELECT_COMPARE_WEEK, {week, preparation});
        } else {
          item.style.fill = Colors.Black;
          this.$store.dispatch(MutationTypes.SELECT_COMPARE_WEEK, {week, preparation});
        }
      });
  }


  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////// LIFECYCLE ///////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      if (this.isDual) {
        this.width = 275;
      }
      this.height = this.calculateSvgHeight(this.anchors);
      this.largestValue = this.getMaxValue(this.anchors);
      let data = this.getData(this.preparation);
      this.trainChart(this.root, data);
    }
  }
}
