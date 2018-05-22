/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {RunType} from '../../../store/state';
import {setupSvg} from '../../../utils/svgInit/svgInit';
import {compareEvents} from '../../../events/Compare/compare';
import {CategoryOpacity} from '../../../models/VisualVariableModel';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';
import {eventBus} from '../../../main';
import {formatDistance} from '../../../utils/format-data';
import {FormatDistanceType} from '../../../models/FormatModel';

@Component({
  template: require('./doughnutChart.html'),
})
export class DoughnutChart extends Vue {
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

  private width = 260;
  private height = 230;
  private thickness = 40;
  private radius = (Math.min(this.width, this.height) / 2) - 10;
  private textElement;
  private donutData;

  @Watch('data')
  @Watch('loadingStatus.activities')
  @Watch('hoveredRunType')
  onPropertyChanged(val: any, oldVal: any) {
    if (val in RunType && this.donutData) {
      let name;
      let unit = 'km';
      let value;
      if (this.hoveredRunType !== RunType.All) {
        let data = this.donutData.categories.find(item => {
          return item.name == this.hoveredRunType
        });
        if (data !== undefined) {
          name = data.name;
          value = data.value;
        } else {
          name = this.hoveredRunType;
          value = 'No data';
          unit = ''
        }
      } else {
        name = 'Total distance';
        value = this.donutData.value;
      }

      this.textElement.val
        .transition()
        .text(value);

      this.textElement.unit
        .transition()
        .text(unit);

      this.textElement.name
        .transition()
        .text(name)

    } else {
      if (this.loadingStatus.activities === loadingStatus.Loaded && this.data !== undefined) {
        this.doughnutChart(this.root, this.index, this.data);
      }
    }
  }

  private addDataToPie(pie: any, data: any) {
    return (pie(data));
  }

  private checkIfLabelIsDrawable(value, totalValue): number {
    if (100 / totalValue * value < 5) {
      return 0;
    } else {
      return 1;
    }
  }

  private handleHover(g, name, value) {
    let valText = g.append('text')
      .attr('class', 'value-text')
      .text(value)
      .attr('text-anchor', 'middle')
      .attr('dy', '2px')
    let valUnit = valText.append('tspan')
      .attr('class', 'value-text-unit')
      .text('km');

    let nameText = g.append('text')
      .attr('class', 'name-text')
      .text(name)
      .attr('text-anchor', 'middle')
      .attr('dy', '20px');

    return {
      val: valText,
      unit: valUnit,
      name: nameText
    };
  }

  private doughnutChart(root: string, index: number, data: any) {
    let svg = setupSvg('#' + root + index, this.width, this.height);
    let values = this.calculateDoughnutPieces(data);
    this.donutData = values;
    this.drawDoughnutChart(svg, values);
  }

  private calculateDoughnutPieces(data: any): any {
    let values = {
      value: 0,
      categories: []
    };

    data.forEach(item => {
      values.value += parseInt(item.distance);
      item.percentages.forEach(type => {
        if (values.categories[type.type] === undefined && type.type !== null) {
          values.categories[type.type] = {
            value: 0,
            name: '',
            index: null
          };
          values.categories[type.type].value += type.distance;

          switch (type.type) {
            case RunType.Run:
              values.categories[type.type].index = 0;
              values.categories[type.type].name = RunType.Run;
              break;
            case RunType.LongRun:
              values.categories[type.type].index = 1;
              values.categories[type.type].name = RunType.LongRun;
              break;
            case RunType.ShortIntervals:
              values.categories[type.type].index = 2;
              values.categories[type.type].name = RunType.ShortIntervals;
              break;
            case RunType.Competition:
              values.categories[type.type].index = 4;
              values.categories[type.type].name = RunType.Competition;
              break;
            case RunType.Uncategorized:
              values.categories[type.type].index = 5;
              values.categories[type.type].name = RunType.Uncategorized;
              break;
          }
        }
      })
    });

    let temp = [];

    for (let key in values.categories) {
      values.categories[key].value = values.categories[key].value.toFixed(2);
      temp.push(values.categories[key]);
    }

    values.categories = temp;
    values.value = parseFloat(values.value.toFixed(2));

    return values;
  }

  private drawDoughnutChart(svg: any, data: any) {
    let g = svg.append('g')
      .attr('transform', 'translate(' + (this.width / 2) + ',' + (this.height / 2) + ')');

    let arc = d3.arc()
      .innerRadius(this.radius - this.thickness)
      .outerRadius(this.radius);

    let pie = d3.pie()
      .value(function(d: any) { return d.value })
      .padAngle(.01)
      .sort(function(a: any, b: any) {
        return a.index - b.index;
      });

    let path = g.selectAll('path')
      .data(this.addDataToPie(pie, data.categories))
      .enter()
      .append('g')
      .attr('class', (d: any) => 'donutChart__segment donutChart__segment--' + d.data.name)
      .attr('opacity', CategoryOpacity.Active)
      .on('mouseover', function(d: any) {
        d3.selectAll('.donutChart__segment')
          .transition()
          .attr('opacity', CategoryOpacity.Inactive);

        d3.selectAll('.donutChart__segment--' + d.data.name)
          .transition()
          .attr('opacity', CategoryOpacity.Active);

        eventBus.$emit(compareEvents.set_Hovered_Run_Type, d.data.name);
      })
      .on('mouseout', function(d: any) {
        d3.selectAll('.donutChart__segment')
          .transition()
          .attr('opacity', CategoryOpacity.Active);

        eventBus.$emit(compareEvents.set_Hovered_Run_Type, RunType.All);
      })
      .append('path')
      .attr('d', arc)
      .attr('class', 'donutChart__arc')
      .attr('id', (d: any) => d.data.name + this.index)
      .attr('fill', (d: any) => getCategoryColor(d.data.name));

    if (this.hoveredRunType !== RunType.All) {
      let val = data.categories.find(item => {
        return item.name == this.hoveredRunType
      });
      if (val !== undefined) {
        this.textElement = this.handleHover(g, val.name, val.value);
      } else {
        this.textElement = this.handleHover(g, 'No Data', 0);
      }
    } else {
      this.textElement = this.handleHover(g, 'Total', data.value);
    }

    let that = this;

    g.selectAll('.labelText')
      .data(data.categories)
      .enter().append('text')
      .attr('class', 'labelText')
      .attr('text-anchor', 'left')
      .attr('x', 10) //Move the text from the start angle of the arc
      .attr('dy', 27) //Move the text down
      .append('textPath')
      .attr('xlink:href',function(d:any,i){return '#' + d.name + that.index;})
      .attr('opacity', (d:any) => that.checkIfLabelIsDrawable(d.value, data.value))
      .text(function(d:any){return (100 / data.value * d.value).toFixed(0) + '%'});
  }

  mounted() {
    if (this.data !== undefined) {
      this.doughnutChart(this.root, this.index, this.data);
    }
  }
}
