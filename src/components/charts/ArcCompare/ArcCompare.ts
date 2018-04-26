/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {FilterModel} from '../../../models/Filter/FilterModel';
import {loadingStatus} from '../../../models/App/AppStatus';
import {getKeys} from '../../../utils/array-helper';
import {calculateCategoryOpacity, getCategoryColor} from '../../../utils/calculateVisualVariables';
import {RunType} from '../../../store/state';

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
  selectedClusters: string[];

  @Watch('data')
  @Watch('loadingStatus.activities')
  @Watch('filter.selectedRunType')
  @Watch('filter.selectedCluster')
  @Watch('filter.selectedTrainingCluster')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.stackedCompare('#' + this.root, this.data, this.filter, this.selectedClusters);
    }
  }

  private stackedCompare(root, data, filter, selectedClusters) {
    let svg = d3.select(root).append('svg')
      .attr('width', 960)
      .attr('height', 500);

    let sortedData = this.getDataToCompare(selectedClusters, data);
    // console.log(sortedData);

    let draw = [];
    let startPos = {
      x: 0,
      y: 150,
    };
    sortedData.map(item => {
      let obj = {};

      startPos.x += item.stats.distance / 9000;
      this.drawHalfCircle(svg, startPos, {distance: item.stats.distance, type: RunType.Uncategorized}, filter);
      startPos.x += item.stats.distance / 9000;
      startPos.x += 120;
      for (let key in item.stats.typeCount) {
        obj[key] = item.stats.typeCount[key];
      }
      draw.push(obj);
    });

    console.log(draw);

    startPos = {
      x: 0,
      y: 150,
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

  private getDataToCompare(selectedClusters: string[], data) {
    return selectedClusters.map(item => {
      return data[item];
    })
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
    // this.stackedCompare('#' + this.root, this.data, this.filter, this.selectedClusters);
  }
}
