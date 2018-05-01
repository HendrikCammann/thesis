/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {ClusterType, RunType} from '../../../store/state';
import {FilterModel} from '../../../models/Filter/FilterModel';
import {selectAndFilterDataset} from '../../../utils/filter-dataset';
import {CanvasConstraints} from '../../../models/VisualVariableModel';
import {
  calculateBarLength, calculateCategoryOpacity, calculateConnectingOpacity, checkIfBarIsDrawable,
  checkIfConnectionIsDrawable, checkIfSpecialVisual, getCategoryColor, getConnectingOrientation,
  setupVisualBarVariables
} from '../../../utils/calculateVisualVariables';
import {formatRadius} from '../../../utils/format-data';
import {FormatDifferenceType, FormatRadiusType} from '../../../models/FormatModel';
import {eventBus} from '../../../main';
import {filterEvents} from '../../../events/filter';

@Component({
  template: require('./SwooshChart.html'),
})
export class SwooshChart extends Vue {
  @Prop()
  data: Object;

  @Prop()
  filter: FilterModel;

  @Prop()
  root: string;

  @Prop()
  canvasConstraints: CanvasConstraints;

  @Watch('data.byMonths')
  @Watch('filter.selectedRunType')
  @Watch('filter.selectedCluster')
  @Watch('filter.timeRange.start')
  @Watch('filter.timeRange.end')
  @Watch('canvasConstraints')
  onPropertyChanged(val: any, oldVal: any) {
    this.swooshChart(this.root, this.data, this.filter, this.canvasConstraints);
  }

  public interpolation = d3.curveBasis;

  /**
   * combines all functions
   * @param root
   * @param canvasConstraints
   * @param dataset
   * @param filter
   */
  public swooshChart(root: string, dataset, filter: FilterModel, canvasConstraints: CanvasConstraints) {
    let data = selectAndFilterDataset(dataset, filter);
    let visualMeasurements = setupVisualBarVariables(data, canvasConstraints);
    let svg = this.setupSvg(root, visualMeasurements);
    let diagram = this.drawDiagram(data, visualMeasurements, svg);
    this.addSwooshesAndBubbles(diagram, svg, this.interpolation);
  }

  /**
   * setup an svg
   * @param root
   * @param metrics
   */
  public setupSvg(root: string, metrics): any {
    d3.select(root + " > svg").remove();
    return d3.select(root)
      .append('svg')
      .attr('width', metrics.width)
      .attr('height', metrics.height);
  }

  /**
   * returns the visual data displayed in diagram
   * @param data
   * @param visualMeasurements
   * @param svg
   */
  public drawDiagram(data, visualMeasurements, svg): any {
    let barPositions = [];
    let rectXPos = visualMeasurements.padding;

    for (let key in data) {
      barPositions[key] = [];
      for (let anchor in data[key].stats.typeCount) {
        let element = {
          start: rectXPos,
          end: 0,
          y: visualMeasurements.height / 2,
          height: 20,
          distance: data[key].stats.typeCount[anchor].distance,
          width: parseFloat(calculateBarLength(data[key].stats.typeCount[anchor].distance, visualMeasurements.calculated.pxPerKm)),
          color: getCategoryColor(data[key].stats.typeCount[anchor].type),
          type: data[key].stats.typeCount[anchor].type,
          cluster: key,
          activities: data[key].stats.typeCount[anchor].activities,
        };

        element.end = element.start + element.width;

        if (checkIfBarIsDrawable(element.width)) {
          svg.append('rect')
            .attr('x', element.start)
            .attr('y', visualMeasurements.height / 2)
            .attr('width', element.width)
            .attr('height', element.height)
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('fill', element.color)
            .attr('opacity', calculateCategoryOpacity(this.filter.selectedRunType, element.type))
            .on('click', function() {
              eventBus.$emit(filterEvents.setRunTypeFilter, element.type);
            });
          rectXPos += parseFloat(calculateBarLength(data[key].stats.typeCount[anchor].distance, visualMeasurements.calculated.pxPerKm));
        }

        barPositions[key].push(element);
      }
      rectXPos += visualMeasurements.calculated.clusterMargin;
    }

    return barPositions;
  }

  /**
   * connects the the bars with swooshes
   * @param diagram
   * @param interpolation
   * @param svg
   */
  public addSwooshesAndBubbles(diagram, svg, interpolation): void {
    let keys = [];
    for (let key in diagram) {
      keys.push(key);
    }

    for (let i = 0; i < keys.length; i++) {
      for (let j = 0; j < diagram[keys[i]].length; j++) {
        let indexOfItemToConnectTo = 1;

        if(diagram[keys[i+indexOfItemToConnectTo]] !== undefined) {
          while (((i + indexOfItemToConnectTo) < keys.length - 1) && (diagram[keys[i + indexOfItemToConnectTo]][j].width === 0)) {
            indexOfItemToConnectTo++;
          }
          if (checkIfConnectionIsDrawable(diagram[keys[i]][j], diagram[keys[i + indexOfItemToConnectTo]][j])) {
            let change = diagram[keys[i + indexOfItemToConnectTo]][j].width - diagram[keys[i]][j].width;

            let arcAttributes = {
              outer: {
                startX: diagram[keys[i]][j].start,
                startY: diagram[keys[i]][j].y,
                endX: diagram[keys[i + indexOfItemToConnectTo]][j].end,
                endY: diagram[keys[i + indexOfItemToConnectTo]][j].y,
                height: Math.abs(change * 7),
                offset: diagram[keys[i + indexOfItemToConnectTo]][j].height,
                centerX: (diagram[keys[i + indexOfItemToConnectTo]][j].end + diagram[keys[i]][j].start) / 2,
                centerY: (diagram[keys[i]][j].y - (Math.abs(change) * 5))
              },
              inner: {
                startX: diagram[keys[i]][j].end,
                startY: diagram[keys[i]][j].y,
                endX: diagram[keys[i + indexOfItemToConnectTo]][j].start,
                endY: diagram[keys[i + indexOfItemToConnectTo]][j].y,
                height: Math.abs(change),
                offset: diagram[keys[i + indexOfItemToConnectTo]][j].height,
                centerX: (diagram[keys[i + indexOfItemToConnectTo]][j].start + diagram[keys[i]][j].end) / 2,
                centerY: (diagram[keys[i]][j].y - (Math.abs(change) * 1.5))
              }
            };

            if (!getConnectingOrientation(diagram[keys[i]][j].width, diagram[keys[i + indexOfItemToConnectTo]][j].width)) {
              arcAttributes.outer.centerY = (diagram[keys[i]][j].y + (Math.abs(change) * FormatDifferenceType.SwooshesOuter));
              arcAttributes.inner.centerY = (diagram[keys[i]][j].y + (Math.abs(change) * FormatDifferenceType.SwooshesInner));
            }

            this.drawSwoosh(interpolation, arcAttributes, svg, diagram[keys[i]][j], diagram[keys[i + indexOfItemToConnectTo]][j]);
          }
        }
        if (checkIfSpecialVisual(diagram[keys[i]][j].type)) {
          this.drawBubbles(diagram[keys[i]][j], svg);
        }
      }
    }
  }

  /**
   *
   * @param interpolation
   * @param arcAttributes
   * @param svg
   * @param actualItem
   * @param nextItem
   */
  public drawSwoosh(interpolation, arcAttributes, svg, actualItem, nextItem): void {
    let swooshData = this.setupSwooshVariables(interpolation, arcAttributes, actualItem, nextItem);

    /*svg.append('path')
      .attr('d', this.createBezierpath(arcAttributes.outer, upper))
      .attr('fill', 'none')
      .attr('stroke-width', '1')
      .attr('stroke-alignment', 'inner')
      .attr('stroke', barPositions[keys[i]][j].color)
      .attr('opacity', this.calculateCategoryOpacity(barPositions[keys[i]][j].type));
    svg.append('path')
      .attr('d', this.createBezierpath(arcAttributes.inner, upper))
      .attr('fill', 'none')
      .attr('stroke-width', '1')
      .attr('stroke-alignment', 'inner')
      .attr('stroke', barPositions[keys[i]][j].color)
      .attr('opacity', this.calculateCategoryOpacity(barPositions[keys[i]][j].type));*/

    svg.append('path')
      .attr('d', swooshData.outerLine)
      .attr('fill', 'none')
      .attr('stroke-width', '1')
      .attr('stroke-alignment', 'inner')
      .attr('stroke', actualItem.color)
      .attr('opacity', calculateConnectingOpacity(this.filter.selectedRunType, actualItem.type));
    svg.append('path')
      .attr('d', swooshData.innerLine)
      .attr('fill', 'none')
      .attr('stroke-width', '1')
      .attr('stroke-alignment', 'inner')
      .attr('stroke', actualItem.color)
      .attr('opacity', calculateConnectingOpacity(this.filter.selectedRunType, actualItem.type));
    svg.append('path')
      .datum(swooshData.swoosh.data)
      .attr('d', swooshData.swoosh.area)
      .attr('fill', actualItem.color)
      .attr('opacity', calculateConnectingOpacity(this.filter.selectedRunType, actualItem.type));
  }

  /**
   *
   * @param interpolation
   * @param arcAttributes
   * @param actualItem
   * @param nextItem
   * @returns {any}
   */
  public setupSwooshVariables(interpolation, arcAttributes, actualItem, nextItem): any {
    let lineGenerator = d3.line().curve(interpolation);

    return {
      outerLine: lineGenerator(this.createLine(arcAttributes.outer, getConnectingOrientation(actualItem.width, nextItem.width))),
      innerLine: lineGenerator(this.createLine(arcAttributes.inner, getConnectingOrientation(actualItem.width, nextItem.width))),
      swoosh: this.createSwooshArea(interpolation, arcAttributes, getConnectingOrientation(actualItem.width, nextItem.width))
    }
  }

  /**
   * returns array of path coordinates
   * @param path
   * @param upper
   */
  public createLine(path, upper: boolean): [number, number][] {
    let offsetX20 = (path.endX - path.startX) * 0.2;
    let offsetY20 = (path.startY - path.centerY) * 0.8;
    let offsetX18 = (path.endX - path.startX) * 0.12;
    let offsetY18 = (path.startY - path.centerY) * 0.70;

    if(!upper) {
      return [
        [path.startX, path.startY + path.offset],
        // [path.startX + offsetX18, path.startY + path.offset - offsetY18],
        [path.startX + offsetX20, path.startY + path.offset - offsetY20],
        [path.centerX, path.centerY + path.offset],
        [path.endX - offsetX20, path.endY + path.offset - offsetY20],
        // [path.endX - offsetX18, path.endY + path.offset - offsetY18],
        [path.endX, path.endY + path.offset]
      ];
    } else {
      return [
        [path.startX, path.startY],
        // [path.startX + offsetX18, path.startY - offsetY18],
        [path.startX + offsetX20, path.startY - offsetY20],
        [path.centerX, path.centerY],
        [path.endX - offsetX20, path.endY - offsetY20],
        // [path.endX - offsetX18, path.endY - offsetY18],
        [path.endX, path.endY]
      ];
    }
  }

  /**
   * returns an bezierpath
   * @param path
   * @param upper
   */
  public createBezierpath(path, upper: boolean): string {
    let start, end, startBezier, endBezier;

    if(!upper) {
      start = 'M' + path.startX + ',' + (path.startY + path.offset);
      end = path.endX  + ',' + (path.endY + path.offset);
      startBezier = 'C' + path.startX + ',' + (path.startY + path.offset + path.height);
      endBezier = path.endX + ',' + (path.endY + path.offset + path.height);
    } else {
      start = 'M' + path.startX + ',' + path.startY;
      end = path.endX  + ',' + path.endY;
      startBezier = 'C' + path.startX + ',' + (path.startY - path.height);
      endBezier = path.endX + ',' + (path.endY - path.height);
    }

    return start + ' ' + startBezier + ' ' + endBezier + ' ' + end;
  }

  /**
   * returns the fill of a swoosh
   * @param attributes
   * @param interpolation
   * @param upper
   */
  public createSwooshArea(interpolation, attributes, upper: boolean): any {
    let outer = this.createLine(attributes.outer, upper);
    let inner = this.createLine(attributes.inner, upper);
    let areaData = [];

    for (let i = 0; i < outer.length; i++) {
      let obj = {
        xOuter: outer[i][0],
        yOuter: outer[i][1],
        xInner: inner[i][0],
        yInner: inner[i][1]
      };
      areaData.push(obj);
    }

    let area = d3.area()
      .curve(interpolation)
      .x0(function (d, i) {
        return areaData[i].xOuter;
      })
      .x1(function (d, i) {
        return areaData[i].xInner;
      })
      .y0(function (d, i) {
        return areaData[i].yOuter;
      })
      .y1(function (d, i) {
        return areaData[i].yInner;
      });

    return {
      area: area,
      data: areaData
    }
  }

  /**
   *
   * @param cluster
   * @param svg
   */
  private drawBubbles(cluster, svg): void {
    let bubbleAttributes = [];
    let numActivities = cluster.activities.length + 1;
    let type = cluster.type;
    let bubbleOffset = 0;

    cluster.activities.map((item, k) => {
      let activity = this.$store.getters.getActivity(item);
      let width = cluster.end - cluster.start;
      let factor = k + 1;
      let offsetX = (width / numActivities) * factor;
      let offsetY = 100 + bubbleOffset;

      let bubble = {
        xPos: cluster.start + offsetX,
        yPos: cluster.y - cluster.height - formatRadius(activity.base_data.distance, FormatRadiusType.Traininghistory) - offsetY,
        radius: formatRadius(activity.base_data.distance, FormatRadiusType.Traininghistory),
        color: cluster.color,
        name: activity.name
      };

      bubbleAttributes.push(bubble);
      bubbleOffset += bubble.radius * 2 +  10;
    });

    bubbleAttributes.map(item => {
      svg.append('circle')
        .attr('cx', item.xPos)
        .attr('cy', item.yPos)
        .attr('r', item.radius)
        .attr('opacity', calculateCategoryOpacity(this.filter.selectedRunType, type))
        .attr('fill', item.color)
        .on('click', function() {
          console.log(item.name);
        });
      svg.append('rect')
        .attr('width', 1)
        .attr('x', item.xPos)
        .attr('y', item.yPos + item.radius + 5)
        .attr('height', Math.abs(item.yPos - cluster.y + item.radius + 10))
        .attr('opacity', calculateConnectingOpacity(this.filter.selectedRunType, type))
        .attr('fill', item.color)
    })
  }

  mounted() {
    // this.swooshChart(this.width, this.height, this.margin, this.data);
  }
}
