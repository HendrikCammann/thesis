/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {LoadingStatus, loadingStatus} from '../../../models/App/AppStatus';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';
import {formatDistance} from '../../../utils/format-data';
import {FormatDistanceType} from '../../../models/FormatModel';
import {CategoryOpacity} from '../../../models/VisualVariableModel';
import {PositionModel} from '../../../models/Chart/ChartModels';
import {getPercentageFromValue} from '../../../utils/numbers/numbers';

@Component({
  template: require('./arcCompare.html'),
})
export class ArcCompare extends Vue {

  @Prop()
  root: string;

  @Prop()
  data: Object;

  @Prop()
  loadingStatus: LoadingStatus;

  @Prop()
  trainingCluster: string[];

  @Watch('data')
  @Watch('loadingStatus.activities')
  @Watch('trainingCluster')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded && this.data !== null) {
      this.arcCompare('#' + this.root, this.data);
    }
  }

  private calculateRadiusFromArea(value): number {
    value = formatDistance(value, FormatDistanceType.Kilometers);
    const focusRadius = 70;
    const focusArea = Math.PI * Math.pow(focusRadius, 2);
    const focusDistance = 1000;

    let factorFromFocus = 100 / focusDistance * value;
    let factorArea = focusArea / 100 * factorFromFocus;

    return Math.sqrt(factorArea / Math.PI);
  }

  private arcCompare(root, data) {
    d3.select(root + " > svg").remove();
    let svg = d3.select(root).append('svg')
      .attr('width', 360)
      .attr('height', 100);

    let draw = [];
    let totalDistance = 0;
    let startPos: PositionModel = {
      x: 0,
      y: 100,
    };

    let obj = {};
    for (let key in data.stats.typeCount) {
      obj[key] = data.stats.typeCount[key];
    }
    draw.push(obj);

    draw.map(cluster => {
      let sumDistance = 0;
      for (let key in cluster) {
        totalDistance += cluster[key].distance;
        sumDistance += this.calculateRadiusFromArea(cluster[key].distance) * 2;
      }
      startPos.x = (360 / 2) - (sumDistance / 2);
    });

    draw.map((cluster, i) => {
      for (let key in cluster) {
        let labelText = formatDistance(cluster[key].distance, FormatDistanceType.Kilometers).toFixed(0);
        if (labelText === '0') {
          labelText = '';
        } else {
          labelText += 'km'
        }
        let textText = getPercentageFromValue(cluster[key].distance, totalDistance).toString();
        if (textText === '0') {
          textText = null;
        } else {
          textText += '%';
        }
        startPos.x += this.calculateRadiusFromArea(cluster[key].distance);
        this.addText(svg, startPos, i, root, key, textText);
        this.drawHalfCircle(svg, startPos, cluster[key], i, root, key);
        this.addLabel(svg, startPos, i, root, key, labelText);
        startPos.x += this.calculateRadiusFromArea(cluster[key].distance);
      }
    });
  }

  private addText(svg, position: PositionModel, index: number, root: string, key: string, text: number | string) {
    let fullId = 'arc' + root.replace('#', '') + index + key + 'text';
    let posY = position.y;
    svg.append('text')
      .attr('x', position.x)
      .attr('y', posY)
      .attr('text-anchor', 'middle')
      .attr('class', 'arcCompare__text')
      .attr('id', fullId)
      .attr('opacity', 0)
      .text(text);
  }

  private addLabel(svg, position: PositionModel, index: number, root: string, key: string, text: number | string) {
    let fullId = 'arc' + root.replace('#', '') + index + key + 'label';
    let posY = position.y;
    svg.append('text')
      .attr('x', position.x)
      .attr('y', posY - 5)
      .attr('class', 'arcCompare__label')
      .attr('text-anchor', 'middle')
      .attr('id', fullId)
      .text(text);
  }

  private drawHalfCircle(svg, position: PositionModel, item, index: number, root: string, key: string) {
    let arc = d3.arc();
    let fullId = 'arc' + root.replace('#', '') + index + key;
    let hoverOffset = 15;

    let xPos = position.x;
    let yPos = position.y;
    svg.append('path')
      .attr('transform', 'translate(' + [ xPos , yPos ] + ')')
      .attr('opacity', CategoryOpacity.Active)
      .attr('id', fullId)
      .attr('fill', getCategoryColor(item.type))
      .attr('class', 'arcCompare__circle')
      .attr('d', arc({
        innerRadius: 0,
        outerRadius: this.calculateRadiusFromArea(item.distance),
        startAngle: -Math.PI * 0.5,
        endAngle: Math.PI * 0.5
      }))
      .on('mouseenter', () => {
        console.log(d3.select('#' + fullId));
        d3.select('#' + fullId)
          .transition()
          .attr('transform', 'translate(' + [ xPos, yPos - hoverOffset ] + ')');
        d3.select('#' + fullId + 'label')
          .transition()
          .attr('transform', 'translate(' + [ 0, - hoverOffset ] + ')');
        d3.select('#' + fullId + 'text')
          .transition()
          .attr('opacity', 1);
      })
      .on('mouseleave', () => {
        console.log(d3.select('#' + fullId));
        d3.select('#' + fullId)
          .transition()
          .attr('transform', 'translate(' + [ xPos, yPos ] + ')');
        d3.select('#' + fullId + 'label')
          .transition()
          .attr('transform', 'translate(' + [ 0, 0 ] + ')');
        d3.select('#' + fullId + 'text')
          .transition()
          .attr('opacity', 0);
      });
  }

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded && this.data !== null) {
      this.arcCompare('#' + this.root, this.data);
    }
  }
}
