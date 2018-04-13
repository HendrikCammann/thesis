/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {ClusterType, RunType} from '../../../store/state';
import {FilterModel} from '../../../models/FilterModel';
import {toPoints} from 'svg-points';

@Component({
  template: require('./ArcChart.html'),
})
export class ArcChart extends Vue {
  @Prop()
  data: Object;

  @Prop()
  filter: FilterModel;

  @Watch('data.byMonths')
  @Watch('filter.selectedRunType')
  @Watch('filter.selectedCluster')
  @Watch('filter.timeRange.start')
  @Watch('filter.timeRange.end')
  onPropertyChanged(val: any, oldVal: any) {
    this.swooshChart('#arc', this.data, this.filter);
  }

  public interpolation = d3.curveBasis;

  /**
   * combines all functions
   * @param root
   * @param dataset
   * @param filter
   */
  public swooshChart(root: string, dataset, filter: FilterModel) {
    let data = this.selectDataset(dataset, filter);
    let visualMeasurements = this.setupVisualVariables(data);

    let svg = this.setupSvg(root, visualMeasurements);

    let diagram = this.drawDiagram(data, visualMeasurements, svg);
    this.connectDiagram(diagram, svg);
  }

  public formatKey(key: string) {
    let year = parseInt(key.substring(0,4));
    console.log(year);
    return year;
  }


  /**
   * sets correct cluster from overall dataset
   * @param dataset
   * @param filter
   */
  public selectDataset(dataset, filter: FilterModel): any {
    let tempData;
    let startYear;
    let endYear;

    if(filter.timeRange.start) {
      startYear = filter.timeRange.start.getFullYear();
    } else {
      startYear = -1
    }

    if(filter.timeRange.end) {
      endYear = filter.timeRange.end.getFullYear();
    } else {
      endYear = 10000;
    }

    switch (filter.selectedCluster) {
      case ClusterType.All:
        tempData = dataset.all;
        break;
      case ClusterType.ByYears:
        tempData = dataset.byYears;
        break;
      case ClusterType.ByMonths:
        tempData = dataset.byMonths;
        break;
      case ClusterType.ByWeeks:
        tempData = dataset.byWeeks;
        break;
    }

    let returnData = [];
    if (filter.showEverything) {
      returnData = tempData;
    } else {
      for (let key in tempData) {
        if (this.formatKey(key) >= startYear && this.formatKey(key) <= endYear) {
          returnData.push(tempData[key]);
        }
      }
    }

    return returnData;
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
   * sets the base diagram variables based on dataset
   * @param dataset
   */
  public setupVisualVariables(dataset: Object): any {
    let visualMeasurements = {
      width: 1200,
      height: 800,
      clusterMaxMargin: 180,
      calculated: {
        totalDistance: 0,
        totalClusters: 0,
        displayedWidth: 1200,
        clusterMargin: 0,
        pxPerKm: 0,
      }
    };

    for (let key in dataset) {
      visualMeasurements.calculated.totalDistance += dataset[key].stats.distance;
      visualMeasurements.calculated.totalClusters++;
    }

    if (visualMeasurements.calculated.totalClusters > 1) {
      visualMeasurements.calculated.displayedWidth = visualMeasurements.width - visualMeasurements.clusterMaxMargin;
    }

    visualMeasurements.calculated.clusterMargin = parseFloat((visualMeasurements.clusterMaxMargin / visualMeasurements.calculated.totalClusters).toFixed(2));
    visualMeasurements.calculated.totalDistance = parseFloat((visualMeasurements.calculated.totalDistance / 1000).toFixed(2));
    visualMeasurements.calculated.pxPerKm = parseFloat((visualMeasurements.calculated.displayedWidth / visualMeasurements.calculated.totalDistance).toFixed(2));

    return visualMeasurements;
  }

  /**
   * returns the visual data displayed in diagram
   * @param data
   * @param visualMeasurements
   * @param svg
   */
  public drawDiagram(data, visualMeasurements, svg): any {
    let barPositions = [];
    let rectXPos = 0;

    for (let key in data) {
      barPositions[key] = [];
      for (let anchor in data[key].stats.typeCount) {
        let element = {
          start: rectXPos,
          end: 0,
          y: visualMeasurements.height / 2,
          height: 20,
          distance: data[key].stats.typeCount[anchor].distance,
          width: parseFloat(this.calculateBarLength(data[key].stats.typeCount[anchor].distance, visualMeasurements.calculated.pxPerKm)),
          color: this.diagramColor(data[key].stats.typeCount[anchor].type),
          type: data[key].stats.typeCount[anchor].type,
          cluster: key,
        };

        element.end = element.start + element.width;

        if (element.width != 0) {
          svg.append('rect')
            .attr('x', element.start)
            .attr('y', visualMeasurements.height / 2)
            .attr('width', element.width)
            .attr('height', element.height)
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('fill', element.color)
            .attr('opacity', this.calculateCategoryOpacity(element.type))
            .on('mouseenter', function() {
              // console.log(anchor)
            });

          rectXPos += (data[key].stats.typeCount[anchor].distance / 1000) * visualMeasurements.calculated.pxPerKm;
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
   * @param svg
   */
  public connectDiagram(diagram, svg): void {
    let keys = [];
    let that = this;

    for (let key in diagram) {
      keys.push(key);
    }

    for (let i = 0; i < keys.length - 1; i++) {
      for (let j = 0; j < diagram[keys[i]].length; j++) {
        if (diagram[keys[i+1]][j] !== undefined && diagram[keys[i]][j].type !== null && diagram[keys[i+1]][j].width !== 0) {
          let arcAttributes = {
            outer: {
              start: diagram[keys[i]][j].start,
              end: diagram[keys[i+1]][j].end,
              xPos: (diagram[keys[i]][j].start + diagram[keys[i+1]][j].end) / 2,
              yPos: diagram[keys[i]][j].y,
              radius: (diagram[keys[i+1]][j].end - diagram[keys[i]][j].start) / 2,
              offset: diagram[keys[i]][j].height
            },
            inner: {
              xPos: (diagram[keys[i]][j].end + diagram[keys[i+1]][j].start) / 2,
              yPos: diagram[keys[i]][j].y,
              radius: Math.abs((diagram[keys[i+1]][j].start - diagram[keys[i]][j].end) / 2),
              offset: diagram[keys[i]][j].height
            }
          };

          console.log(arcAttributes);
          let isUpper = diagram[keys[i+1]][j].width > diagram[keys[i]][j].width;

          this.createArc(arcAttributes, svg, isUpper, diagram[keys[i]][j].color, this.calculateSwooshOpacity(diagram[keys[i]][j].type));
        }
      }
    }
  }

  public createArc(arcAttributes, svg, isUpper, color, opacity): void {
    let xPosOuter = arcAttributes.outer.xPos;
    let yPosOuter = arcAttributes.outer.yPos;
    let xPosInner = arcAttributes.inner.xPos;
    let yPosInner = arcAttributes.inner.yPos;
    let startAngle = -Math.PI * 0.5;
    let endAngle = Math.PI * 0.5;

    let maskPosRect = arcAttributes.outer.yPos - arcAttributes.outer.radius;

    console.log(isUpper);

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

    /*svg.append('path')
      .attr('d', arc({
        innerRadius: 0,
        outerRadius: arcAttributes.outer.radius,
        startAngle: startAngle,
        endAngle: endAngle
      }))*/

    svg.append('circle')
      .attr('cx', xPosOuter)
      .attr('cy', yPosOuter)
      .attr('r', arcAttributes.outer.radius)
      .attr('mask', clipId)
      .attr('opacity', opacity)
      .attr('fill', color)
      // .attr('transform', 'translate(' + [xPosOuter, yPosOuter] + ')');

    /*svg.append('path')
      .attr('d', arc({
        innerRadius: 0,
        outerRadius: arcAttributes.inner.radius,
        startAngle: startAngle,
        endAngle: endAngle
      }))
      .attr('opacity', 1)
      .attr('fill', 'white')
      .attr('transform', 'translate(' + [xPosInner, yPosInner] + ')');*/

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
   * @param upper
   */
  public createSwooshArea(attributes, upper: boolean): any {
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
      .curve(this.interpolation)
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
   * shows or hides the swoosh based on filter
   * @param type
   */
  public calculateCategoryOpacity(type: RunType): number {
    if(type == null) {
      return 0
    }
    if(this.filter.selectedRunType == RunType.All) {
      return 0.7;
    }
    if(type == this.filter.selectedRunType) {
      return 0.7;
    }
    return 0.15;
  }

  /**
   * shows or hides the swoosh fill based on filter
   * @param type
   */
  public calculateSwooshOpacity(type: RunType): number {
    if(type == null) {
      return 0.1
    }
    if(this.filter.selectedRunType == RunType.All) {
      return 0.2;
    }
    if(type == this.filter.selectedRunType) {
      return 0.2;
    }
    return 0.05;
  }

  /**
   * returns the length of a bar in px
   * @param distance
   * @param factor
   */
  public calculateBarLength(distance, factor: number): string {
    distance = (distance / 1000) * factor;
    distance = distance.toFixed(2);

    return distance;
  }

  /**
   * returns the color for each category
   * @param type
   */
  public diagramColor(type: RunType): string {
    switch(type) {
      case RunType.Run:
        return '#1280B2';
      case RunType.Competition:
        return '#B2AB09';
      case RunType.LongRun:
        return '#00AFFF';
      case RunType.ShortIntervals:
        return '#FF1939';
      case RunType.Uncategorized:
        return 'violet';
      default:
        return 'black';
    }
  }

  mounted() {
    // this.swooshChart(this.width, this.height, this.margin, this.data);
  }
}
