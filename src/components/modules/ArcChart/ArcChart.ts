/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {ClusterType, RunType} from '../../../store/state';
import {FilterModel} from '../../../models/Filter/FilterModel';
import {MutationTypes} from '../../../store/mutation-types';
import {formatDistance, formatRadius, getPercentualOffset} from '../../../utils/format-data';
import {FormatDifferenceType, FormatDistanceType, FormatRadiusType} from '../../../models/FormatModel';
import {
  calaculateConnectingHeight,
  calculateBarLength,
  calculateCategoryOpacity, calculateConnectingOpacity, checkIfBarIsDrawable, checkIfConnectionIsDrawable,
  checkIfSpecialVisual, createAreaBetweenLines, findConnectionTarget,
  getCategoryColor, getConnectingOrientation, setupVisualBarVariables
} from '../../../utils/calculateVisualVariables';
import {checkIfMatchesRunType, selectAndFilterDataset} from '../../../utils/filter-dataset';
import {CanvasConstraints, CategoryConnectingOpacity} from '../../../models/VisualVariableModel';
import {filterBus} from '../../../main';
import {filterEvents} from '../../../events/filter';
import {getKeys} from '../../../utils/array-helper';
import {LoadingStatus, loadingStatus} from '../../../models/App/AppStatus';

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
  loadingStatus: any;

  @Prop()
  canvasConstraints: CanvasConstraints;

  @Watch('data')
  @Watch('loadingStatus.activities')
  @Watch('filter.selectedRunType')
  @Watch('filter.selectedCluster')
  @Watch('filter.selectedTrainingCluster')
  @Watch('filter.timeRange.start')
  @Watch('filter.timeRange.end')
  @Watch('canvasConstraints')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.arcChart(this.root, this.data, this.filter, this.canvasConstraints);
    }
  }

  private maxChange = 0;

  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  //////////////////////////////All//////////////////////////////
  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////

  /**
   *
   * @param {string} root
   * @param {Object} dataset
   * @param {FilterModel} filter
   * @param {CanvasConstraints} canvasConstraints
   */
  private arcChart(root: string, dataset: Object, filter: FilterModel, canvasConstraints: CanvasConstraints) {
    let data = selectAndFilterDataset(dataset, filter);
    let visualMeasurements = setupVisualBarVariables(data, canvasConstraints);
    let svg = this.setupSvg(root, visualMeasurements);
    let diagram = this.drawDiagram(data, visualMeasurements, svg, filter);
    let activities = this.addActivities(diagram, svg, filter);
    this.addActivitiesConnection(svg, diagram, activities, filter);
    this.addArcsAndBubbles(diagram, svg, canvasConstraints.height, this.maxChange);
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
   * @param filter
   * @param svg
   */
  private drawDiagram(data, visualMeasurements, svg, filter): any {
    let barPositions = [];
    let rectXPos = visualMeasurements.padding;

    for (let key in data) {
      barPositions[key] = [];
      this.addTextToBar(svg, rectXPos, visualMeasurements.height / 2 + 30, data[key].rangeName);

      for (let anchor in data[key].stats.typeCount) {
        let element = {
          start: rectXPos,
          end: 0,
          y: visualMeasurements.height / 2,
          height: visualMeasurements.barHeight,
          distance: data[key].stats.typeCount[anchor].distance,
          width: parseFloat(calculateBarLength(data[key].stats.typeCount[anchor].distance, visualMeasurements.calculated.pxPerKm)),
          color: getCategoryColor(data[key].stats.typeCount[anchor].type),
          opacity: calculateCategoryOpacity(filter.selectedRunType, data[key].stats.typeCount[anchor].type),
          type: data[key].stats.typeCount[anchor].type,
          cluster: key,
          activities: data[key].stats.typeCount[anchor].activities,
        };

        element.end = element.start + element.width;

        if (checkIfBarIsDrawable(element.width)) {
          svg.append('rect')
            .attr('x', element.start)
            .attr('y', element.y)
            .attr('width', element.width)
            .attr('height', element.height)
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('fill', element.color)
            .attr('opacity', element.opacity)
            .on('click', function() {
              filterBus.$emit(filterEvents.setRunTypeFilter, element.type);
            });

          rectXPos += (element.width + visualMeasurements.barMargin);
        }

        barPositions[key].push(element);
      }
      rectXPos += visualMeasurements.calculated.clusterMargin;
    }

    for (let i = 0; i < barPositions.length; i++) {
      for (let j = 0; j < barPositions[i].length; j++) {
        if (barPositions[i + 1] !== undefined) {
          if (Math.abs(barPositions[i][j].distance - barPositions[i + 1][j].distance) > this.maxChange && barPositions[i + 1][j].distance !== 0 && barPositions[i][j].distance !== 0) {
            this.maxChange = Math.abs(barPositions[i][j].distance - barPositions[i + 1][j].distance);
          }
        }
      }
    }
    return barPositions;
  }



  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  /////////////////////////////Text//////////////////////////////
  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////

  /**
   * added the name of a segment to the bar
   * @param svg
   * @param xPos
   * @param yPos
   * @param name
   */
  private addTextToBar(svg: any, xPos: number, yPos: number, name: string) {
    svg.append('text')
      .attr('x', xPos)
      .attr('y', yPos)
      .attr('font-size', '10px')
      .text(name);
  }



  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  /////////////////////////////Arcs//////////////////////////////
  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////

  /**
   * connects the the bars with arcs
   * @param diagram
   * @param svg
   */
  private addArcsAndBubbles(diagram, svg, canvasHeight, maxArcHeight): void {
    let keys = getKeys(diagram);

    for (let i = 0; i < keys.length; i++) {
      for (let j = 0; j < diagram[keys[i]].length; j++) {
        let indexOfItemToConnectTo = findConnectionTarget(i, j, keys, diagram);

        if(diagram[keys[i + indexOfItemToConnectTo]] !== undefined) {
          if (checkIfConnectionIsDrawable(diagram[keys[i]][j], diagram[keys[i + indexOfItemToConnectTo]][j])) {
            if (indexOfItemToConnectTo === 1) {
              this.drawArc(this.setupArcVariables(diagram[keys[i]][j], diagram[keys[i + indexOfItemToConnectTo]][j], canvasHeight, maxArcHeight), svg, getConnectingOrientation(diagram[keys[i]][j].width, diagram[keys[i + indexOfItemToConnectTo]][j].width), diagram[keys[i]][j].color, calculateConnectingOpacity(this.filter.selectedRunType, diagram[keys[i]][j].type));
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

  /**
   *
   * @param actualItem
   * @param nextItem
   * @returns {any}
   */
  private setupArcVariables(actualItem, nextItem, canvasHeight, maxArcHeight): any {
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
          height: calaculateConnectingHeight(actualItem.width, nextItem.width, FormatDifferenceType.Arcs, maxArcHeight, canvasHeight, actualItem.height),
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
          height: calaculateConnectingHeight(actualItem.width, nextItem.width, FormatDifferenceType.Arcs, maxArcHeight, canvasHeight, actualItem.height),
        }
      },
    }
  }

  /**
   *
   * @param pathAttributes
   * @param svg
   * @param isUpper
   * @param color
   * @param opacity
   */
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



  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  ///////////////////////Activity Bars///////////////////////////
  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////

  /**
   *
   * @param diagram
   * @param svg
   * @param {FilterModel} filter
   */
  private addActivities(diagram, svg, filter: FilterModel): any {
    let keys = getKeys(diagram);
    let activityBlocks = [];

    for (let i = 0; i < keys.length; i++) {
      let blockPosition = {
        start: {
          x: 0,
          y: 0,
        },
        end: {
          x: 0,
          y: 0,
        },
      };

      for (let j = 0; j < diagram[keys[i]].length; j++) {
        let position = {
          x: (diagram[keys[i]][j].start + diagram[keys[i]][j].end) / 2,
          y: 100,
        };

        blockPosition.start.y = position.y;
        blockPosition.end.y = position.y;

        let length = diagram[keys[i]][j].activities.length - 1;
        diagram[keys[i]][j].activities.map((item, k) => {
          let activity = this.setupActivityVariables(item, diagram[keys[i]][j].activities.length, position, filter.selectedRunType)
          position.x += this.drawActivity(activity, svg);

          if (activity) {
            if (k === 0) {
              blockPosition.start.x = activity.xPos;
            }

            if (k === length) {
              blockPosition.end.x = activity.xPos + activity.width;
            }
          }
        });
      }
      activityBlocks.push(blockPosition);
    }

    return activityBlocks;
  }

  /**
   *
   * @param activityId
   * @param {number} amount
   * @param position
   * @param {RunType} filterRunType
   * @returns {any}
   */
  private setupActivityVariables(activityId: any, amount: number, position: any, filterRunType: RunType): any {
    let activity = this.$store.getters.getActivity(activityId);
    if (checkIfMatchesRunType(filterRunType, activity.categorization.activity_type, true)) {
      let elementMargin = 1;
      let totalWidth = (amount * 5) + ((amount - 1) * elementMargin);

      return {
        xPos: position.x - (totalWidth / 2),
        yPos: position.y - parseFloat(calculateBarLength(activity.base_data.distance, 0.2)) * 10,
        height: parseFloat(calculateBarLength(activity.base_data.distance, 0.2)) * 10,
        width: 5,
        margin: elementMargin,
        name: activity.name,
        type: activity.categorization.activity_type,
        opacity: calculateCategoryOpacity(filterRunType, activity.categorization.activity_type),
        color: getCategoryColor(activity.categorization.activity_type),
      };
    } else {
      return false;
    }
  }

  /**
   *
   * @param activityAttributes
   * @param svg
   * @returns {number}
   */
  private drawActivity(activityAttributes, svg): number {
    if (activityAttributes) {
      svg.append('rect')
        .attr('x', activityAttributes.xPos)
        .attr('y', activityAttributes.yPos)
        .attr('height', activityAttributes.height)
        .attr('width', activityAttributes.width)
        .attr('opacity', activityAttributes.opacity)
        .attr('fill', activityAttributes.color)
        .on('click', function() {
          console.log(activityAttributes.name);
        });
      return (activityAttributes.width + activityAttributes.margin);
    } else {
      return 0
    }
  }



  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  ////////////////////Activity Connection////////////////////////
  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////

  /**
   *
   * @param svg
   * @param diagram
   * @param activities
   * @param filter
   */
  private addActivitiesConnection(svg, diagram, activities, filter) {
    for (let i = 0; i < activities.length; i++) {
      diagram[i].map(bar => {
        if (checkIfMatchesRunType(filter.selectedRunType, bar.type, true)) {
          this.drawActivitiesConnection(svg, this.setupActivitiesConnectionVariables(bar, activities[i]), bar.type)
        }
      })
    }
  }

  /**
   *
   * @param bar
   * @param block
   * @returns {any}
   */
  private setupActivitiesConnectionVariables(bar, block): any {
    return {
      id: bar.start + '-' + block.start.x,
      left: {
        start: {
          x: bar.start,
          y: bar.y,
        },
        mid: {
          x: bar.start - getPercentualOffset(bar.start, block.start.x, 0.2),
          y: bar.y - getPercentualOffset(bar.y, block.start.y, 0.75),
        },
        end: {
          x: block.start.x ,
          y: block.start.y,
        },
      },
      right: {
        start: {
          x: bar.end,
          y: bar.y,
        },
        mid: {
          x: bar.end + getPercentualOffset(bar.end, block.end.x, 0.2),
          y: bar.y - getPercentualOffset(bar.y, block.end.y, 0.75),
        },
        end: {
          x: block.end.x,
          y: block.end.y,
        }
      }
    }
  }

  /**
   *
   * @param svg
   * @param variables
   * @param type
   */
  private drawActivitiesConnection(svg, variables, type): void {
    let leftPath = [];
    leftPath.push([variables.left.start.x, variables.left.start.y]);
    // leftPath.push([variables.left.mid.x, variables.left.mid.y]);
    leftPath.push([variables.left.end.x, variables.left.end.y]);

    let rightPath = [];
    rightPath.push([variables.right.start.x, variables.right.start.y]);
    // rightPath.push([variables.right.mid.x, variables.right.mid.y]);
    rightPath.push([variables.right.end.x, variables.right.end.y]);

    let area = createAreaBetweenLines(leftPath, rightPath);

    let gradientId = 'url(#' + variables.id +')';
    let defs = svg.append('defs');
    let gradient = defs.append('linearGradient')
                    .attr('id', variables.id)
                    .attr("x1", "0%")
                    .attr("x2", "0%")
                    .attr("y1", "0%")
                    .attr("y2", "100%");

    gradient.append("stop")
      .attr('class', 'start')
      .attr("offset", "0%")
      .attr("stop-color", getCategoryColor(type))
      .attr("stop-opacity", CategoryConnectingOpacity.ActivityArea);

    gradient.append("stop")
      .attr('class', 'end')
      .attr("offset", "100%")
      .attr("stop-color", getCategoryColor(type))
      .attr("stop-opacity", 0.02);

    svg.append('path')
      .datum(area.data)
      .attr('d', area.area)
      .attr("fill", gradientId);
  }

  mounted() {
    if (this.$store.getters.getAppLoadingStatus.activities === loadingStatus.NotLoaded) {
      // this.arcChart(this.root, this.data, this.filter, this.canvasConstraints);
    }
  }
}
