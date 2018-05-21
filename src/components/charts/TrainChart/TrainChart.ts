import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {setupSvg} from '../../../utils/svgInit/svgInit';
import {LoadingStatus, loadingStatus} from '../../../models/App/AppStatus';
import {ClusterWrapper} from '../../../models/State/StateModel';
import {getLargerValue, getPercentageFromValue} from '../../../utils/numbers/numbers';
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
  private weekHeight = 150 - (2 * this.padding);
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
    let barItems = this.drawUnfoldedChart(svg, data.byWeeks, this.weekHeight, this.padding, this.largestValue);
    this.drawUnfoldedConnections(svg, barItems);
  }


  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////// UNFOLDED ////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////

  private drawUnfoldedChart(svg: any, data: any, weekHeight: number, padding: number, largestValue: number): any {
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
      let barItem = this.drawBar(svg, barLength, position, distance, CategoryColors.Default);
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
      .attr('x', position.x + 15)
      .attr('y', position.y)
      .attr('height', 1)
      .attr('width', width - 15)
      .attr('fill', color);
  }

  private drawUnfoldedConnections(svg: any, barItems: any) {
    console.log('in');
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
          console.log(length);

          this.drawLineConnection(svg, position, length, barWidth, CategoryColors.Default);
        }
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
  private drawBar(svg: any, barLength: number, position: PositionModel, distance: number | string, color: CategoryColors) {
    let width = 15;
    svg.append('rect')
      .attr('x', position.x)
      .attr('y', position.y)
      .attr('rx', width / 2)
      .attr('ry', width / 2)
      .attr('height', barLength)
      .attr('width', width)
      .attr('fill', color)
      .attr('opacity', 1);

    svg.append('text')
      .attr('x', position.x + width + 4)
      .attr('y', position.y + 14)
      .attr('fill', color)
      .attr('text-anchor', 'right')
      .text(distance);

    return {
      xStart: position.x,
      yStart: position.y,
      xEnd: position.x,
      yEnd: position.y + barLength,
      width: width,
      length: barLength,
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
