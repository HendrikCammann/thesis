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
import {CategoryOpacity} from '../../../models/VisualVariableModel';

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
          index: null
        };
      }

      values.categories[item.categorization.activity_type].value += item.base_data.distance;
      values.categories[item.categorization.activity_type].name = item.categorization.activity_type;
      values.value += item.base_data.distance;
      switch (item.categorization.activity_type) {
        case RunType.Run:
          values.categories[item.categorization.activity_type].index = 0;
          break;
        case RunType.LongRun:
          values.categories[item.categorization.activity_type].index = 1;
          break;
        case RunType.ShortIntervals:
          values.categories[item.categorization.activity_type].index = 2;
          break;
        case RunType.Competition:
          values.categories[item.categorization.activity_type].index = 4;
          break;
        case RunType.Uncategorized:
          values.categories[item.categorization.activity_type].index = 5;
          break;
      }
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
      .value(function(d: any) { console.log(d); return d.value })
      .padAngle(.01)
      .sort(function(a: any, b: any) {
        return a.index - b.index;
      });

    let path = g.selectAll('path')
      .data(this.addDataToPie(pie, donutData.categories))
      .enter()
      .append('g')
      .attr('class', (d: any) => 'donutChart__segment donutChart__segment--' + d.data.name)
      .attr('opacity', CategoryOpacity.Active)
      .on('mouseover', function(d: any) {
        console.log(d3.selectAll('.donutChart__segment'));
        d3.selectAll('.donutChart__segment')
          .transition()
          .attr('opacity', CategoryOpacity.Inactive);

        d3.selectAll('.donutChart__segment--' + d.data.name)
          .transition()
          .attr('opacity', CategoryOpacity.Active);
        // eventBus.$emit(compareEvents.set_Hovered_Run_Type, d.data.name);
      })
      .on('mouseout', function(d: any) {
        d3.selectAll('.donutChart__segment')
          .transition()
          .attr('opacity', CategoryOpacity.Active);
        // eventBus.$emit(compareEvents.set_Hovered_Run_Type, RunType.All);
      })
      .append('path')
      .attr('d', arc)
      .attr('class', 'donutChart__arc')
      .attr('id', (d: any) => d.data.name + index)
      .attr('fill', (d: any) => getCategoryColor(d.data.name));

      g.append('text')
        .attr('class', 'value-text')
        .text(donutData.value)
        .attr('text-anchor', 'middle')
        .attr('dy', '2px')
        .append('tspan')
        .attr('class', 'value-text-unit')
        .text('km');

      g.append('text')
        .attr('class', 'name-text')
        .text('Total distance')
        .attr('text-anchor', 'middle')
        .attr('dy', '20px');

    /*if (this.hoveredRunType !== RunType.All) {
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
    }*/

    g.selectAll('.labelText')
      .data(donutData.categories)
        .enter().append('text')
      .attr('class', 'labelText')
      .attr('text-anchor', 'left')
      .attr('x', 10) //Move the text from the start angle of the arc
      .attr('dy', 27) //Move the text down
        .append('textPath')
      .attr('xlink:href',function(d:any,i){return '#' + d.name + index;})
      .attr('opacity', (d:any) => this.checkIfLabelIsDrawable(d.value, donutData.value))
      .text(function(d:any){return (100 / donutData.value * d.value).toFixed(0) + '%'});
  }

  private checkIfLabelIsDrawable(value, totalValue): number {
    if (100 / totalValue * value < 5) {
      return 0;
    } else {
      return 1;
    }
  }

  private handleHover(g, name, value): void {
  }

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded && this.data !== undefined) {
      this.donutChart('#' + this.root + this.index, this.data, this.index);
    }
  }
}
