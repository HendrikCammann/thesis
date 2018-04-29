/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {FilterModel} from '../../../models/Filter/FilterModel';
import {loadingStatus} from '../../../models/App/AppStatus';
import {getKeys} from '../../../utils/array-helper';
import {calculateCategoryOpacity, getCategoryColor} from '../../../utils/calculateVisualVariables';
import {RunType} from '../../../store/state';
import {getDataToCompare} from '../../../utils/compareData/compareData';

@Component({
  template: require('./arcCompare.html'),
})
export class ArcCompare extends Vue {

  @Prop()
  root: string;

  @Prop()
  filter: FilterModel;

  @Prop()
  data: Object;

  @Prop()
  loadingStatus: any;

  @Prop()
  trainingCluster: string;

  @Watch('data')
  @Watch('loadingStatus.activities')
  @Watch('filter.selectedRunType')
  @Watch('filter.selectedCluster')
  @Watch('filter.selectedTrainingCluster')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded && this.data !== null) {
      this.arcCompare('#' + this.root, this.data, this.filter, this.trainingCluster);
    }
  }

  private arcCompare(root, data, filter, selectedCluster) {
    d3.select(root + " > svg").remove();
    let svg = d3.select(root).append('svg')
      .attr('width', 390)
      .attr('height', 100);


    let draw = [];
    let startPos = {
      x: 0,
      y: 100,
    };

    let obj = {};

    startPos.x += data.stats.distance / 9000;
    // this.drawHalfCircle(svg, startPos, {distance: item.stats.distance, type: RunType.Uncategorized}, filter);
    startPos.x += data.stats.distance / 9000;
    startPos.x += 120;
    for (let key in data.stats.typeCount) {
      obj[key] = data.stats.typeCount[key];
    }
    draw.push(obj);

    startPos = {
      x: 0,
      y: 100,
    };

    draw.map(cluster => {
      for (let key in cluster) {
        startPos.x += cluster[key].distance / 9000;
        this.drawHalfCircle(svg, startPos, cluster[key], filter);
        startPos.x += cluster[key].distance / 9000;
      }
      startPos.x += 120;
    });
  }

  private drawHalfCircle(svg, position, item, filter) {
    let arc = d3.arc();
    return svg.append('path')
      .attr('transform', 'translate('+[position.x , position.y]+')')
      .attr('opacity', 0.8)
      .attr('fill', getCategoryColor(item.type))
      .attr('d', arc({
        innerRadius: 0,
        outerRadius: item.distance / 9000,
        startAngle: -Math.PI*0.5,
        endAngle: Math.PI*0.5
      }));
  }

  mounted() {
    // this.arcCompare('#' + this.root, this.data, this.filter, this.selectedClusters);
  }
}
