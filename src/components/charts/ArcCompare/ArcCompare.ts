/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {LoadingStatus, loadingStatus} from '../../../models/App/AppStatus';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';
import {formatDistance} from '../../../utils/format-data';
import {FormatDistanceType} from '../../../models/FormatModel';
import {CategoryOpacity} from '../../../models/VisualVariableModel';

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
    let startPos = {
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
        sumDistance += this.calculateRadiusFromArea(cluster[key].distance) * 2;
      }
      startPos.x = (360 / 2) - (sumDistance / 2);
    });

    draw.map(cluster => {
      for (let key in cluster) {
        startPos.x += this.calculateRadiusFromArea(cluster[key].distance);
        this.drawHalfCircle(svg, startPos, cluster[key]);
        startPos.x += this.calculateRadiusFromArea(cluster[key].distance);
      }
    });
  }

  private drawHalfCircle(svg, position, item) {
    let arc = d3.arc();
    return svg.append('path')
      .attr('transform', 'translate('+[position.x , position.y]+')')
      .attr('opacity', CategoryOpacity.Active)
      .attr('fill', getCategoryColor(item.type))
      .attr('d', arc({
        innerRadius: 0,
        outerRadius: this.calculateRadiusFromArea(item.distance),
        startAngle: -Math.PI*0.5,
        endAngle: Math.PI*0.5
      }));
  }

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded && this.data !== null) {
      this.arcCompare('#' + this.root, this.data);
    }
  }
}
