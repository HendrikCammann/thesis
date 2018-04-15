/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {ClusterType, RunType} from '../../../store/state';
import {FilterModel} from '../../../models/FilterModel';
import {MutationTypes} from '../../../store/mutation-types';
import {formatDistance, formatRadius} from '../../../utils/format-data';
import {FormatDistanceType, FormatRadiusType} from '../../../models/FormatModel';
import {
  calculateBarLength,
  calculateCategoryOpacity, calculateConnectingOpacity, checkIfBarIsDrawable, checkIfConnectionIsDrawable,
  checkIfSpecialVisual,
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
          rectXPos += parseFloat(calculateBarLength(data[key].stats.typeCount[anchor].distance, visualMeasurements.calculated.pxPerKm));
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
        if(diagram[keys[i+1]] !== undefined) {
          if (checkIfConnectionIsDrawable(diagram[keys[i]][j], diagram[keys[i + 1]][j])) {
            this.drawArc(this.setupArcVariables(diagram[keys[i]][j], diagram[keys[i + 1]][j]), svg, getConnectingOrientation(diagram[keys[i]][j].width, diagram[keys[i + 1]][j].width), diagram[keys[i]][j].color, calculateConnectingOpacity(this.filter.selectedRunType, diagram[keys[i]][j].type));
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
  private setupArcVariables(actualItem, nextItem): any {
    return {
      outer: {
        start: actualItem.start,
        end: nextItem.end,
        xPos: (actualItem.start + nextItem.end) / 2,
        yPos: actualItem.y,
        radius: (nextItem.end - actualItem.start) / 2,
        offset: actualItem.height
      },
      inner: {
        xPos: (actualItem.end + nextItem.start) / 2,
        yPos: actualItem.y,
        radius: Math.abs((nextItem.start - actualItem.end) / 2),
        offset: actualItem.height
      }
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
    let xPosOuter = arcAttributes.outer.xPos;
    let yPosOuter = arcAttributes.outer.yPos;
    let xPosInner = arcAttributes.inner.xPos;
    let yPosInner = arcAttributes.inner.yPos;
    let startAngle = -Math.PI * 0.5;
    let endAngle = Math.PI * 0.5;

    let maskPosRect = arcAttributes.outer.yPos - arcAttributes.outer.radius;

    if (!isUpper) {
      yPosOuter += arcAttributes.outer.offset;
      yPosInner += arcAttributes.inner.offset;
      startAngle = Math.PI * 0.5;
      endAngle = Math.PI * 1.5;

      maskPosRect = arcAttributes.outer.yPos + arcAttributes.outer.offset;
    }

    let arc = d3.arc();
    let id = 'mask_' + xPosOuter + '-' + xPosInner;
    let clipId = 'url(#' + id + ')';

    let mask = svg.append('mask')
      .attr('id', id);

    mask.append('rect')
      .attr('width', arcAttributes.outer.end - arcAttributes.outer.start)
      .attr('height', arcAttributes.outer.radius)
      .attr('fill', 'white')
      .attr('x', arcAttributes.outer.start)
      .attr('y', maskPosRect);

    mask.append('path')
      .attr('d', arc({
        innerRadius: 0,
        outerRadius: arcAttributes.inner.radius,
        startAngle: startAngle,
        endAngle: endAngle
      }))
      .attr('fill-rule', 'evenodd')
      .attr('fill', 'black')
      .attr('transform', 'translate('+[xPosInner, yPosInner]+')');

    svg.append('circle')
      .attr('class', 'no-pointer')
      .attr('cx', xPosOuter)
      .attr('cy', yPosOuter)
      .attr('r', arcAttributes.outer.radius)
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
