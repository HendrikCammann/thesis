/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {ClusterType, RunType} from '../../../store/state';
import {FilterModel} from '../../../models/FilterModel';

@Component({
  template: require('./SwooshChart.html'),
})
export class SwooshChart extends Vue {
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
    this.swooshChart('#swoosh', this.data, this.filter);
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
      height: 400,
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
        let indexOfItemToConnectTo = 1;

        while (((i + indexOfItemToConnectTo) < keys.length - 1) && (diagram[keys[i + indexOfItemToConnectTo]][j].width === 0)) {
          indexOfItemToConnectTo++;
        }

        let drawArc = true;

        if ((i + indexOfItemToConnectTo) === keys.length - 1) {
          drawArc = diagram[keys[i + indexOfItemToConnectTo]][j].width !== 0;
        }

        if (diagram[keys[i]][j].type != null && drawArc) {
          let upper = diagram[keys[i + indexOfItemToConnectTo]][j].width > diagram[keys[i]][j].width;
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

          if(!upper) {
            arcAttributes.outer.centerY = (diagram[keys[i]][j].y + (Math.abs(change) * 5));
            arcAttributes.inner.centerY = (diagram[keys[i]][j].y + (Math.abs(change) * 1.5));
          }

          let lineGenerator = d3.line().curve(this.interpolation);
          let outerLine = lineGenerator(this.createLine(arcAttributes.outer, upper));
          let innerLine = lineGenerator(this.createLine(arcAttributes.inner, upper));
          let swoosh = this.createSwooshArea(arcAttributes, upper);

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
            .attr('d', outerLine)
            .attr('fill', 'none')
            .attr('stroke-width', '1')
            .attr('stroke-alignment', 'inner')
            .attr('stroke', diagram[keys[i]][j].color)
            .attr('opacity', this.calculateSwooshOpacity(diagram[keys[i]][j].type));
          svg.append('path')
            .attr('d', innerLine)
            .attr('fill', 'none')
            .attr('stroke-width', '1')
            .attr('stroke-alignment', 'inner')
            .attr('stroke', diagram[keys[i]][j].color)
            .attr('opacity', this.calculateSwooshOpacity(diagram[keys[i]][j].type));
          svg.append('path')
            .datum(swoosh.data)
            .attr('d', swoosh.area)
            .attr('fill', diagram[keys[i]][j].color)
            .attr('opacity', this.calculateSwooshOpacity(diagram[keys[i]][j].type))
            .on('mouseout', function(d) {
              /*d3.select(this).transition().duration(200)
                .style("opacity", that.calculateSwooshOpacity(diagram[keys[i]][j].type));*/
            })
            .on('mouseover', function(d) {
              /*d3.select(this).transition().duration(200)
                .style("opacity", 0.7);*/
            });
        }
      }
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
