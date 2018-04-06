/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {RunType} from '../../../store/state';

@Component({
  template: require('./SwooshChart.html'),
})
export class SwooshChart extends Vue {
  @Prop()
  data: Object;

  @Prop()
  runType: RunType;


  @Watch('data.byMonths')
  @Watch('runType')
  onPropertyChanged(val: any, oldVal: any) {
    console.log('changed');
    this.swooshChart(this.data);
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
      default:
        return 'violet';
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
    if(this.runType === RunType.All) {
      return 1;
    }
    if(type === this.runType) {
      return 1;
    }
    return 0.2;
  }

  public swooshChart(dataset) {
    let data = dataset.byMonths;
    let visualMeasurements = this.setupVisualVariables(data);
    let rectXPos = 0;
    let barPositions = [];
    d3.select("svg").remove();
    let svg = d3.select('#swoosh')
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

        let outerArc = {
          start: barPositions[keys[i]][j].start,
          end: barPositions[keys[i + 1]][j].end
        };

        let innerArc = {
          start: barPositions[keys[i]][j].end,
          end: barPositions[keys[i + 1]][j].start
        };

        let upper = barPositions[keys[i + 1]][j].width > barPositions[keys[i]][j].width;
        let hasChanged = (barPositions[keys[i + 1]][j].width - barPositions[keys[i]][j].width) != 0;

        if (hasChanged) {
          // console.log(barPositions[keys[i + 1]][j].width + ' vs. ' + barPositions[keys[i]][j].width);
          svg.append('path')
            .attr('d', this.createOuterBezierpath(outerArc.start, barPositions[keys[i]][j].y, outerArc.end, barPositions[keys[i + 1]][j].y, upper))
            .attr('fill', 'none')
            .attr('stroke-width', '1')
            .attr('stroke', barPositions[keys[i]][j].color)
            .attr('opacity', this.calaculateOpacity(barPositions[keys[i]][j].type));
          svg.append('path')
            .attr('d', this.createInnerBezierpath(innerArc.start, barPositions[keys[i]][j].y, innerArc.end, barPositions[keys[i + 1]][j].y, upper))
            .attr('fill', 'none')
            .attr('stroke-width', '1')
            .attr('stroke', barPositions[keys[i]][j].color)
            .attr('opacity', this.calaculateOpacity(barPositions[keys[i]][j].type));
        }
      }

    }

  }

  public createOuterBezierpath(startX, startY, endX, endY, upper) {
    let start = 'M' + startX + ',' + startY;
    let end = endX  + ',' + endY;
    let startBezier;
    let endBezier;

    if(!upper) {
      start = 'M' + startX + ',' + (startY + 15);
      end = endX  + ',' + (endY + 15);
      startBezier = 'C' + startX + ',' + (startY + 15 + 100);
      endBezier = endX + ',' + (endY + 15 + 100);
    } else {
      startBezier = 'C' + startX + ',' + (startY - 100);
      endBezier = endX + ',' + (endY - 100);
    }

    return start + ' ' + startBezier + ' ' + endBezier + ' ' + end;
  }

  public createInnerBezierpath(startX, startY, endX, endY, upper) {
    let start = 'M' + startX + ',' + startY;
    let end = endX  + ',' + endY;
    let startBezier;
    let endBezier;

    if(!upper) {
      start = 'M' + startX + ',' + (startY + 15);
      end = endX  + ',' + (endY + 15);
      startBezier = 'C' + startX + ',' + (startY + 15 + 10);
      endBezier = endX + ',' + (endY + 15 + 10);
    } else {
      startBezier = 'C' + startX + ',' + (startY - 10);
      endBezier = endX + ',' + (endY - 10);
    }

    return start + ' ' + startBezier + ' ' + endBezier + ' ' + end;
  }

  mounted() {
    // this.swooshChart(this.width, this.height, this.margin, this.data);
  }
}
