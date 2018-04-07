/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {ClusterType, RunType} from '../../../store/state';

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

  public getColor(type) {
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

  public setupVisualVariables(dataset) {
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

  public calculateBarLength(distance, factor) {
    distance = (distance / 1000) * factor;
    distance = distance.toFixed(2);

    return distance;
  }

  public calaculateOpacity(type) {
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

  public selectDataset(dataset, type) {
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

  public swooshChart(root, dataset, clusterType) {
    let data = this.selectDataset(dataset, clusterType);
    let visualMeasurements = this.setupVisualVariables(data);
    let rectXPos = 0;
    let barPositions = [];

    d3.select(root + " > svg").remove();
    let svg = d3.select(root)
      .append('svg')
      .attr('width', visualMeasurements.width)
      .attr('height', visualMeasurements.height);

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
          color: this.getColor(data[key].stats.typeCount[anchor].type),
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
          .attr('opacity', this.calaculateOpacity(element.type))
          .on('mouseenter', function() {
            // console.log(anchor)
          });

        rectXPos += (data[key].stats.typeCount[anchor].distance / 1000) * visualMeasurements.calculated.pxPerKm;

        barPositions[key].push(element);
      }
      rectXPos += visualMeasurements.calculated.clusterMargin;
    }

    let keys = [];

    for (let key in barPositions) {
      keys.push(key);
    }

    for (let i = 0; i < keys.length - 1; i++) {
      for (let j = 0; j < barPositions[keys[i]].length; j++) {
        let indexOfItemToConnectTo = 1;

        while (((i + indexOfItemToConnectTo) < keys.length - 1) && (barPositions[keys[i + indexOfItemToConnectTo]][j].width === 0)) {
          indexOfItemToConnectTo++;
        }

        let drawArc = true;

        if ((i + indexOfItemToConnectTo) === keys.length - 1) {
          drawArc = barPositions[keys[i + indexOfItemToConnectTo]][j].width !== 0;
        }

        let upper = barPositions[keys[i + indexOfItemToConnectTo]][j].width > barPositions[keys[i]][j].width;
        let change = barPositions[keys[i + indexOfItemToConnectTo]][j].width - barPositions[keys[i]][j].width;

        let arcAttributes = {
          outer: {
            startX: barPositions[keys[i]][j].start,
            startY: barPositions[keys[i]][j].y,
            endX: barPositions[keys[i + indexOfItemToConnectTo]][j].end,
            endY: barPositions[keys[i + indexOfItemToConnectTo]][j].y,
            height: Math.abs(change * 7),
            offset: barPositions[keys[i + indexOfItemToConnectTo]][j].height,
            centerX: (barPositions[keys[i + indexOfItemToConnectTo]][j].end + barPositions[keys[i]][j].start) / 2,
            centerY: (barPositions[keys[i]][j].y - (Math.abs(change) * 5))
          },
          inner: {
            startX: barPositions[keys[i]][j].end,
            startY: barPositions[keys[i]][j].y,
            endX: barPositions[keys[i + indexOfItemToConnectTo]][j].start,
            endY: barPositions[keys[i + indexOfItemToConnectTo]][j].y,
            height: Math.abs(change),
            offset: barPositions[keys[i + indexOfItemToConnectTo]][j].height,
            centerX: (barPositions[keys[i + indexOfItemToConnectTo]][j].start + barPositions[keys[i]][j].end) / 2,
            centerY: (barPositions[keys[i]][j].y - (Math.abs(change) * 2))
          }
        };

        let interpolateTypes = [d3.curveLinear,d3.curveStepBefore,d3.curveStepAfter,d3.curveBasis,d3.curveBasisOpen, d3.curveBasisClosed, d3.curveBundle,d3.curveCardinal,d3.curveCardinal,d3.curveCardinalOpen,d3.curveCardinalClosed,d3.curveNatural];
        let lineGenerator = d3.line().curve(d3.curveCardinal);
        let outerline = lineGenerator(this.createLine(arcAttributes.outer, upper));
        let innerline = lineGenerator(this.createLine(arcAttributes.inner, upper));

        if (drawArc && upper) {
          /*svg.append('path')
            .attr('d', this.createBezierpath(arcAttributes.outer, upper))
            .attr('fill', 'none')
            .attr('stroke-width', '1')
            .attr('stroke-alignment', 'inner')
            .attr('stroke', barPositions[keys[i]][j].color)
            .attr('opacity', this.calaculateOpacity(barPositions[keys[i]][j].type));
          svg.append('path')
            .attr('d', this.createBezierpath(arcAttributes.inner, upper))
            .attr('fill', 'none')
            .attr('stroke-width', '1')
            .attr('stroke-alignment', 'inner')
            .attr('stroke', barPositions[keys[i]][j].color)
            .attr('opacity', this.calaculateOpacity(barPositions[keys[i]][j].type));*/

          svg.append('path')
            .attr('d', outerline)
            .attr('fill', 'none')
            .attr('stroke-width', '1')
            .attr('stroke-alignment', 'inner')
            .attr('stroke', barPositions[keys[i]][j].color)
            .attr('opacity', this.calaculateOpacity(barPositions[keys[i]][j].type));
          svg.append('path')
            .attr('d', innerline)
            .attr('fill', 'none')
            .attr('stroke-width', '1')
            .attr('stroke-alignment', 'inner')
            .attr('stroke', barPositions[keys[i]][j].color)
            .attr('opacity', this.calaculateOpacity(barPositions[keys[i]][j].type));
        }
      }
    }
  }

  public createLine(path, upper): [number, number][] {
    if(!upper) {
      return [[path.startX, path.startY + path.offset], [path.centerX, path.centerY + path.offset], [path.endX, path.endY + path.offset]];
    } else {
      return [[path.startX, path.startY], [path.centerX, path.centerY], [path.endX, path.endY]];
    }

  }

  public createBezierpath(path, upper) {
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

  mounted() {
    // this.swooshChart(this.width, this.height, this.margin, this.data);
  }
}
