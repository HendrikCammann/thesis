/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {ClusterType, RunType} from '../../../store/state';
import {area} from 'd3-shape';
import {scaleLinear} from 'd3-scale';

@Component({
  template: require('./SwooshChart.html'),
})
export class SwooshChart extends Vue {
  @Prop()
  data: Object;

  @Prop()
  runType: RunType;

  @Prop()
  clusterType: ClusterType;

  @Watch('data.byMonths')
  @Watch('runType')
  @Watch('clusterType')
  onPropertyChanged(val: any, oldVal: any) {
    this.swooshChart('#swoosh', this.data, this.clusterType);
  }

  /**
   * combines all functions
   * @param root
   * @param dataset
   * @param clusterType
   */
  public swooshChart(root: string, dataset, clusterType: ClusterType) {
    let data = this.selectDataset(dataset, clusterType);
    let visualMeasurements = this.setupVisualVariables(data);

    let svg = this.setupSvg(root, visualMeasurements);

    let diagram = this.drawDiagram(data, visualMeasurements, svg);
    this.connectDiagram(diagram, svg);
  }

  /**
   * sets correct cluster from overall dataset
   * @param dataset
   * @param type
   */
  public selectDataset(dataset, type: ClusterType): any {
    switch (type) {
      case ClusterType.All:
        return dataset.all;
      case ClusterType.ByYears:
        return dataset.byYears;
      case ClusterType.ByMonths:
        return dataset.byMonths;
      case ClusterType.ByWeeks:
        return dataset.byWeeks;
    }
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
      height: 600,
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
          height: 15,
          distance: data[key].stats.typeCount[anchor].distance,
          width: parseFloat(this.calculateBarLength(data[key].stats.typeCount[anchor].distance, visualMeasurements.calculated.pxPerKm)),
          color: this.diagramColor(data[key].stats.typeCount[anchor].type),
          type: data[key].stats.typeCount[anchor].type,
          cluster: key,
        };

        element.end = element.start + element.width;

        svg.append('rect')
          .attr('x', element.start)
          .attr('y', visualMeasurements.height / 2)
          .attr('width', element.width)
          .attr('height', element.height)
          .attr('fill', element.color)
          .attr('opacity', this.calculateCategoryOpacity(element.type))
          .on('mouseenter', function() {
            // console.log(anchor)
          });

        rectXPos += (data[key].stats.typeCount[anchor].distance / 1000) * visualMeasurements.calculated.pxPerKm;

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

        if (drawArc) {
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

          let lineGenerator = d3.line().curve(d3.curveNatural);
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
            .attr('opacity', this.calculateCategoryOpacity(diagram[keys[i]][j].type));
          svg.append('path')
            .attr('d', innerLine)
            .attr('fill', 'none')
            .attr('stroke-width', '1')
            .attr('stroke-alignment', 'inner')
            .attr('stroke', diagram[keys[i]][j].color)
            .attr('opacity', this.calculateCategoryOpacity(diagram[keys[i]][j].type));
          svg.append('path')
            .datum(swoosh.data)
            .attr('d', swoosh.area)
            .attr('fill', diagram[keys[i]][j].color)
            .attr('opacity', this.calculateSwooshOpacity(diagram[keys[i]][j].type));
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
    if(!upper) {
      return [[path.startX, path.startY + path.offset], [path.centerX, path.centerY + path.offset], [path.endX, path.endY + path.offset]];
    } else {
      return [[path.startX, path.startY], [path.centerX, path.centerY], [path.endX, path.endY]];
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
      .curve(d3.curveNatural)
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
    if(type === null) {
      return 0
    }
    if(this.runType === RunType.All) {
      return 1;
    }
    if(type === this.runType) {
      return 1;
    }
    return 0.15;
  }

  /**
   * shows or hides the swoosh fill based on filter
   * @param type
   */
  public calculateSwooshOpacity(type: RunType): number {
    if(type === null) {
      return 0
    }
    if(this.runType === RunType.All) {
      return 0.35;
    }
    if(type === this.runType) {
      return 0.35;
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
