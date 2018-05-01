/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {LoadingStatus, loadingStatus} from '../../../models/App/AppStatus';
import {calculateCategoryOpacity, getCategoryColor} from '../../../utils/calculateVisualVariables';
import {formatDistance} from '../../../utils/format-data';
import {FormatDistanceType} from '../../../models/FormatModel';
import {eventBus} from '../../../main';
import {compareEvents} from '../../../events/Compare/compare';
import {RunType} from '../../../store/state';

@Component({
  template: require('./donutChart.html'),
})
export class DonutChart extends Vue {

  @Prop()
  root: string;

  @Prop()
  index: number;

  @Prop()
  data: any[];

  @Prop()
  loadingStatus: LoadingStatus;

  @Prop()
  hoveredRunType: RunType;

  @Watch('data')
  @Watch('loadingStatus.activities')
  @Watch('hoveredRunType')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded && this.data !== undefined) {
      this.donutChart('#' + this.root + this.index, this.data, this.index);
    }
  }

  private addDataToPie(pie: any, data: any) {
    return (pie(data));
  }

  private createDonutPieces(data): any {
    let values = {
      value: 0,
      categories: []
    };
    data.map(item => {
      // console.log(item);
      if (values.categories[item.categorization.activity_type] === undefined) {
        values.categories[item.categorization.activity_type] = {
          value: 0,
          name: '',
        };
      }

      values.categories[item.categorization.activity_type].value += item.base_data.distance;
      values.categories[item.categorization.activity_type].name = item.categorization.activity_type;
      values.value += item.base_data.distance;
    });

    let temp = [];

    for (let key in values.categories) {
      values.categories[key].value = formatDistance(values.categories[key].value, FormatDistanceType.Kilometers).toFixed(2);
      temp.push(values.categories[key]);
    }

    values.categories = temp;
    values.value = parseFloat(formatDistance(values.value, FormatDistanceType.Kilometers).toFixed(2));
    return values;
  }

  private donutChart(root, data, index) {
    if (this.index === 0) {
      this.createDonutPieces(data);
    }

    let donutData = this.createDonutPieces(data);

    let text = '';

    let width = 260;
    let height = 260;
    let thickness = 40;
    let duration = 750;

    let radius = Math.min(width, height) / 2.5;

    d3.select(root + ' > svg').remove();
    let svg = d3.select(root)
      .append('svg')
      .attr('class', 'pie')
      .attr('width', width)
      .attr('height', height);

    let g = svg.append('g')
      .attr('transform', 'translate(' + (width/2) + ',' + (height/2) + ')');

    let arc = d3.arc()
      .innerRadius(radius - thickness)
      .outerRadius(radius);

    let pie = d3.pie()
      .value(function(d: any) { return d.value })
      .padAngle(.01)
      .sort(null);

    let path = g.selectAll('path')
      .data(this.addDataToPie(pie, donutData.categories))
      .enter()
      .append('g')
      .on('mouseover', function(d: any) {
        eventBus.$emit(compareEvents.set_Hovered_Run_Type, d.data.name);
      })
      .on('mouseout', function(d) {
        eventBus.$emit(compareEvents.set_Hovered_Run_Type, RunType.All);
      })
      .append('path')
      .attr('d', arc)
      .attr('id', (d: any, i:any) => d.data.name + index)
      .attr('opacity', (d: any) => calculateCategoryOpacity(this.hoveredRunType, d.data.name))
      .attr('fill', (d: any) => getCategoryColor(d.data.name));

    if (this.hoveredRunType !== RunType.All) {
      let data = donutData.categories.find(item => {
        return item.name == this.hoveredRunType
      });
      if (data !== undefined) {
        this.handleHover(g, data.name, data.value);
      } else {
        this.handleHover(g, 'No Data', 0);
      }
    } else {
      this.handleHover(g, 'Total', donutData.value);
    }

    g.selectAll('.labelText')
      .data(donutData.categories)
        .enter().append('text')
      .attr('class', 'labelText')
      .attr('text-anchor', 'left')
      .attr('x', 10) //Move the text from the start angle of the arc
      .attr('dy', 25) //Move the text down
        .append('textPath')
      .attr('xlink:href',function(d:any,i){return '#' + d.name + index;})
      .attr('opacity', (d:any) => this.checkIfLabelIsDrawable(d.value, donutData.value))
      .text(function(d:any){return (100 / donutData.value * d.value).toFixed(0) + '%'});
  }

  private checkIfLabelIsDrawable(value, totalValue) {
    if (100 / totalValue * value < 5) {
      return 0;
    } else {
      return 1;
    }
  }

  private handleHover(g, name, value) {
    g.append('text')
      .attr('class', 'name-text')
      .text(name)
      .attr('text-anchor', 'middle')
      .attr('dy', '-1.2em');

    g.append('text')
      .attr('class', 'value-text')
      .text(value + 'km')
      .attr('text-anchor', 'middle')
      .attr('dy', '.6em');
  }

  mounted() {
    // this.donutChart('#' + this.root + this.index, this.data);
  }
}
