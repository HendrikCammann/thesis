/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {ClusterType, RunType} from '../../../store/state';
import {FilterModel} from '../../../models/Filter/FilterModel';
import {MutationTypes} from '../../../store/mutation-types';
import {formatDistance, formatRadius} from '../../../utils/format-data';
import {FormatDifferenceType, FormatDistanceType, FormatRadiusType} from '../../../models/FormatModel';
import {
  calaculateConnectingHeight,
  calculateBarLength,
  calculateCategoryOpacity, calculateConnectingOpacity, checkIfBarIsDrawable, checkIfConnectionIsDrawable,
  checkIfSpecialVisual, findConnectionTarget,
  getCategoryColor, getConnectingOrientation, setupVisualBarVariables
} from '../../../utils/calculateVisualVariables';
import {selectAndFilterDataset} from '../../../utils/filter-dataset';
import {CanvasConstraints} from '../../../models/VisualVariableModel';
import {filterBus} from '../../../main';
import {filterEvents} from '../../../events/filter';

@Component({
  template: require('./ArcChart.html'),
})
export class ArcChart extends Vue {
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
    this.arcChart(this.root, this.data, this.filter, this.canvasConstraints);
  }

  /**
   *
   * @param {string} root
   * @param {Object} dataset
   * @param {FilterModel} filter
   * @param {CanvasConstraints} canvasConstraints
   */
  public arcChart(root: string, dataset: Object, filter: FilterModel, canvasConstraints: CanvasConstraints) {
    let data = selectAndFilterDataset(dataset, filter);
    let visualMeasurements = setupVisualBarVariables(data, canvasConstraints);
    let svg = this.setupSvg(root, visualMeasurements);
    let diagram = this.drawDiagram(data, visualMeasurements, svg);
    this.addArcsAndBubbles(diagram, svg);
  }

  /**
   * setup an svg
   * @param root
   * @param metrics
   */
  private setupSvg(root: string, metrics: any): any {
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
  private drawDiagram(data, visualMeasurements, svg): any {
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
              filterBus.$emit(filterEvents.setRunTypeFilter, element.type);
            });
          rectXPos += (parseFloat(calculateBarLength(data[key].stats.typeCount[anchor].distance, visualMeasurements.calculated.pxPerKm)) + visualMeasurements.barMargin);
        }

        barPositions[key].push(element);
      }
      rectXPos += visualMeasurements.calculated.clusterMargin;
    }

    return barPositions;
  }

  /**
   * connects the the bars with arcs
   * @param diagram
   * @param svg
   */
  private addArcsAndBubbles(diagram, svg): void {
    let keys = [];

    for (let key in diagram) {
      keys.push(key);
    }

    for (let i = 0; i < keys.length; i++) {
      for (let j = 0; j < diagram[keys[i]].length; j++) {
        let indexOfItemToConnectTo = findConnectionTarget(i, j, keys, diagram);

        if(diagram[keys[i + indexOfItemToConnectTo]] !== undefined) {
          if (checkIfConnectionIsDrawable(diagram[keys[i]][j], diagram[keys[i + indexOfItemToConnectTo]][j])) {
            if (indexOfItemToConnectTo === 1) {
              this.drawArc(this.setupArcVariables(diagram[keys[i]][j], diagram[keys[i + indexOfItemToConnectTo]][j]), svg, getConnectingOrientation(diagram[keys[i]][j].width, diagram[keys[i + indexOfItemToConnectTo]][j].width), diagram[keys[i]][j].color, calculateConnectingOpacity(this.filter.selectedRunType, diagram[keys[i]][j].type));
            } else {
              this.drawPath(this.setupPathVariables(diagram[keys[i]][j], diagram[keys[i + indexOfItemToConnectTo]][j]), svg, getConnectingOrientation(diagram[keys[i]][j].width, diagram[keys[i + indexOfItemToConnectTo]][j].width), diagram[keys[i]][j].color, calculateConnectingOpacity(this.filter.selectedRunType, diagram[keys[i]][j].type));
            }
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
   * @param actualItem
   * @param nextItem
   * @returns {any}
   */
  private setupPathVariables(actualItem, nextItem): any {
    return {
      start: {
        xPos: actualItem.start + (Math.abs((actualItem.start - actualItem.end)) / 2),
        yPos: actualItem.y,
      },
      end: {
        xPos: nextItem.end - (Math.abs((nextItem.start - nextItem.end)) / 2),
        yPos: nextItem.y,
      },
      mid: {
        xPos: actualItem.start + (Math.abs((actualItem.start - nextItem.end)) / 2),
        yPos: (actualItem.y + nextItem.y) / 2,
      },
      general: {
        offset: actualItem.height,
      },
    }
  }

  private drawPath(pathAttributes, svg, isUpper, color, opacity) {
    let lineGenerator = d3.line().curve(d3.curveMonotoneX);
    let path = [];
    if (isUpper) {
      path.push([pathAttributes.start.xPos, pathAttributes.start.yPos]);
      path.push([pathAttributes.mid.xPos, pathAttributes.mid.yPos - 30]);
      path.push([pathAttributes.end.xPos, pathAttributes.end.yPos]);
    } else {
      path.push([pathAttributes.start.xPos, pathAttributes.start.yPos + pathAttributes.general.offset]);
      path.push([pathAttributes.mid.xPos, pathAttributes.mid.yPos + pathAttributes.general.offset + 30]);
      path.push([pathAttributes.end.xPos, pathAttributes.end.yPos + pathAttributes.general.offset]);
    }

    svg.append('path')
      .attr('d', lineGenerator(path))
      .attr('stroke-dasharray', '5, 5')
      .attr('fill', 'none')
      .attr('stroke-width', '1')
      .attr('stroke-alignment', 'inner')
      .attr('stroke', color)
      .attr('opacity', opacity);
  }

  /**
   *
   * @param actualItem
   * @param nextItem
   * @returns {any}
   */
  private setupArcVariables(actualItem, nextItem): any {
    return {
      outer: {
        start: actualItem.start,
        end: nextItem.end,
        xPos: (actualItem.start + nextItem.end) / 2,
        yPos: actualItem.y,
        radius: (nextItem.end - actualItem.start) / 2,
        offset: actualItem.height,
        stepVariables: {
          xPos: actualItem.start,
          yPos: actualItem.y,
          width: Math.abs(actualItem.start - actualItem.end),
          height: calaculateConnectingHeight(actualItem.width, nextItem.width, FormatDifferenceType.Arcs),
        }
      },
      inner: {
        xPos: (actualItem.end + nextItem.start) / 2,
        yPos: actualItem.y,
        radius: Math.abs((nextItem.start - actualItem.end) / 2),
        offset: actualItem.height,
        stepVariables: {
          xPos: nextItem.start,
          yPos: actualItem.y,
          width: Math.abs(nextItem.start - nextItem.end),
          height: calaculateConnectingHeight(actualItem.width, nextItem.width, FormatDifferenceType.Arcs),
        }
      },
    }
  }

  /**
   * creates the connecting arcs
   * @param arcAttributes
   * @param svg
   * @param isUpper
   * @param color
   * @param opacity
   */
  private drawArc(arcAttributes, svg, isUpper, color, opacity): void {
    let arcVariables = {
      outer: {
        xPos: arcAttributes.outer.xPos,
        yPos: arcAttributes.outer.yPos,
        offset: arcAttributes.outer.offset,
        radius: arcAttributes.outer.radius,
      },
      inner: {
        xPos: arcAttributes.inner.xPos,
        yPos: arcAttributes.inner.yPos,
        offset: arcAttributes.inner.offset,
        radius: arcAttributes.inner.radius,
      },
      general: {
        startAngle: -Math.PI * 0.5,
        endAngle: Math.PI * 0.5
      }
    };
    let stepVariables = {
      left: {
        xPos: arcAttributes.outer.stepVariables.xPos,
        yPos: arcAttributes.outer.stepVariables.yPos,
        width: arcAttributes.outer.stepVariables.width,
      },
      right: {
        xPos: arcAttributes.inner.stepVariables.xPos,
        yPos: arcAttributes.inner.stepVariables.yPos,
        width: arcAttributes.inner.stepVariables.width,
      },
      general: {
        height: arcAttributes.outer.stepVariables.height,
      },
    };
    let maskVariables = {
      rectangle: {
        height: arcAttributes.outer.radius,
        width: arcAttributes.outer.end - arcAttributes.outer.start,
        yPos: arcAttributes.outer.yPos - arcAttributes.outer.radius,
        xPos: arcAttributes.outer.start,
      },
    };

    const stepActive = true;

    if (stepActive && isUpper) {
      arcVariables.outer.yPos -= stepVariables.general.height;
      arcVariables.inner.yPos -= stepVariables.general.height;
      maskVariables.rectangle.yPos -= stepVariables.general.height;

      stepVariables.left.yPos -= stepVariables.general.height;
      stepVariables.right.yPos -= stepVariables.general.height;
    }

    if (!isUpper) {
      arcVariables.outer.yPos += arcAttributes.outer.offset;
      arcVariables.inner.yPos += arcAttributes.inner.offset;
      arcVariables.general.startAngle = Math.PI * 0.5;
      arcVariables.general.endAngle = Math.PI * 1.5;

      maskVariables.rectangle.yPos = arcAttributes.outer.yPos + arcVariables.outer.offset;

      if (stepActive) {
        arcVariables.outer.yPos += stepVariables.general.height;
        arcVariables.inner.yPos += stepVariables.general.height;

        stepVariables.left.yPos += arcVariables.outer.offset;
        stepVariables.right.yPos += arcVariables.outer.offset;

        maskVariables.rectangle.yPos += stepVariables.general.height;
      }
    }

    let arc = d3.arc();
    let id = 'mask_' + arcVariables.outer.xPos + '-' + arcVariables.inner.xPos;
    let clipId = 'url(#' + id + ')';

    let mask = svg.append('mask')
      .attr('id', id);

    mask.append('rect')
      .attr('width', maskVariables.rectangle.width)
      .attr('height', maskVariables.rectangle.height)
      .attr('fill', 'white')
      .attr('x', maskVariables.rectangle.xPos)
      .attr('y', maskVariables.rectangle.yPos);

    mask.append('path')
      .attr('d', arc({
        innerRadius: 0,
        outerRadius: arcVariables.inner.radius,
        startAngle: arcVariables.general.startAngle,
        endAngle: arcVariables.general.endAngle
      }))
      .attr('fill-rule', 'evenodd')
      .attr('fill', 'black')
      .attr('transform', 'translate('+[arcVariables.inner.xPos, arcVariables.inner.yPos]+')');


    if (stepActive) {
      svg.append('rect')
        .attr('width', stepVariables.left.width)
        .attr('height', stepVariables.general.height)
        .attr('fill', color)
        .attr('opacity', opacity)
        .attr('x', stepVariables.left.xPos)
        .attr('y', stepVariables.left.yPos);

      svg.append('rect')
        .attr('width', stepVariables.right.width)
        .attr('height', stepVariables.general.height)
        .attr('fill', color)
        .attr('opacity', opacity)
        .attr('x', stepVariables.right.xPos)
        .attr('y', stepVariables.right.yPos);
    }

    svg.append('circle')
      .attr('class', 'no-pointer')
      .attr('cx', arcVariables.outer.xPos)
      .attr('cy', arcVariables.outer.yPos)
      .attr('r', arcVariables.outer.radius)
      .attr('mask', clipId)
      .attr('opacity', opacity)
      .attr('fill', color)
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
    // this.arcChart(this.width, this.height, this.margin, this.data);
  }
}
