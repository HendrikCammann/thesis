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
  data: any;

  @Prop()
  loadingStatus: LoadingStatus;

  @Prop()
  hoveredRunType: RunType;

  @Prop()
  timeRange: any;

  @Prop()
  selectedCluster: string;

  @Watch('data')
  @Watch('loadingStatus.activities')
  @Watch('hoveredRunType')
  @Watch('timeRange.end')
  @Watch('timeRange.start')
  onPropertyChanged(val: any, oldVal: any) {
    if (val in RunType) {
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
        this.donutChart('#' + this.root + this.index, this.data, this.index, this.timeRange, this.selectedCluster);
      }
    }
  }

  private textElement;
  private donutData;

  private addDataToPie(pie: any, data: any) {
    return (pie(data));
  }

  private createDonutPieces(data, hiddenCluster): any {
    let values = {
      value: 0,
      categories: []
    };
    for (let key in data) {
      if (hiddenCluster.indexOf(key) < 0) {
        for (let runType in data[key].stats.typeCount) {
          if (values.categories[runType] === undefined) {
            values.categories[runType] = {
              value: 0,
              name: '',
              index: null
            };
          }
          values.categories[runType].value += data[key].stats.typeCount[runType].distance;
          values.value += data[key].stats.typeCount[runType].distance;
          switch (runType) {
            case 'run':
              values.categories[runType].index = 0;
              values.categories[runType].name = RunType.Run;
              break;
            case 'longRun':
              values.categories[runType].index = 1;
              values.categories[runType].name = RunType.LongRun;
              break;
            case 'interval':
              values.categories[runType].index = 2;
              values.categories[runType].name = RunType.ShortIntervals;
              break;
            case 'competition':
              values.categories[runType].index = 4;
              values.categories[runType].name = RunType.Competition;
              break;
            case 'uncategorized':
              values.categories[runType].index = 5;
              values.categories[runType].name = RunType.Uncategorized;
              break;
          }
        }
      }
    }
    let temp = [];

    for (let key in values.categories) {
      values.categories[key].value = formatDistance(values.categories[key].value, FormatDistanceType.Kilometers).toFixed(2);
      temp.push(values.categories[key]);
    }

    values.categories = temp;
    values.value = parseFloat(formatDistance(values.value, FormatDistanceType.Kilometers).toFixed(2));

    return values;
  }

  private donutChart(root, data, index, timeRange, selectedCluster) {
    let dataCopy = data.byWeeks;
    let cluster = this.$store.getters.getCluster(selectedCluster);

    let timeScale = d3.scaleTime().domain([0, 1140]).range([cluster.timeRange.start, cluster.timeRange.end]);
    let timeScale2 = d3.scaleTime().domain([0, 1140]).range([cluster.timeRange.start, cluster.timeRange.end]);

    let startDate = timeScale(timeRange.start).toString();
    let endDate = timeScale2(timeRange.end).toString();

    let hideInDisplay = [];
    for (let key in dataCopy) {
      if (Date.parse(dataCopy[key].rangeDate) >= Date.parse(startDate) && Date.parse(dataCopy[key].rangeDate) <= Date.parse(endDate)) {
      } else {
        hideInDisplay.push(key);
      }
    }

    /*if (this.index === 0) {
      this.createDonutPieces(data);
    }*/

    let donutData = this.createDonutPieces(dataCopy, hideInDisplay);
    this.donutData = donutData;

    let width = 260;
    let height = 230;
    let thickness = 40;

    let radius = (Math.min(width, height) / 2) - 10;


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
      .attr('id', (d: any) => d.data.name + index)
      .attr('fill', (d: any) => getCategoryColor(d.data.name));

    if (this.hoveredRunType !== RunType.All) {
      let data = donutData.categories.find(item => {
        return item.name == this.hoveredRunType
      });
      if (data !== undefined) {
        this.textElement = this.handleHover(g, data.name, data.value);
      } else {
        this.textElement = this.handleHover(g, 'No Data', 0);
      }
    } else {
      this.textElement = this.handleHover(g, 'Total', donutData.value);
    }

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

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded && this.data !== undefined) {
      // this.donutChart('#' + this.root + this.index, this.data, this.index, this.selectedCluster);
    }
  }
}
