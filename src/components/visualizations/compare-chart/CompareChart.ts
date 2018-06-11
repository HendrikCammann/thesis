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
import {setupSvg} from '../../../utils/svgInit/svgInit';
import {DisplayType} from '../../../store/state';

@Component({
  template: require('./compareChart.html'),
})
export class CompareChart extends Vue {

  @Prop()
  root: string;

  @Prop()
  data: any[];

  @Prop()
  index: number;

  @Prop()
  loadingStatus: LoadingStatus;

  @Prop()
  displayType: DisplayType;

  private maxRadius: number = 60;
  private offset: number = 8;
  private width: number = 171;
  private height: number = 0;

  @Watch('data')
  @Watch('loadingStatus.activities')
  @Watch('displayType')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.height = this.calculateHeight(this.maxRadius, this.offset, this.data.length);
      this.drawChart(this.data, this.index, this.root);
    }
  }

  mounted() {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.height = this.calculateHeight(this.maxRadius, this.offset, this.data.length);
      this.drawChart(this.data, this.index, this.root);
    }
  }

  private calculateHeight(maxRadius, offset, items) {
    return ((maxRadius * 2) * items) + (offset * (items - 1));
  }

  private drawChart(data, index, root) {
    let svg = setupSvg('#' + root, this.width, this.height);
    let circles = this.createCircles(data, index, this.width, this.maxRadius, this.offset);
    this.drawCircles(svg, circles, index);

  }

  private createCircles(data, index, width, maxRadius, offset) {
    let circles = [];
    let position: PositionModel = {
      x: 0,
      y: 0
    };

    if (index % 2 === 0) {
      position.x = width;
      position.y = 0;
    } else {
      position.x = 0;
      position.y = 0;
    }

    data.forEach(item => {
      position.y += maxRadius;
      let tempPos: PositionModel = {
        x: position.x,
        y: position.y,
      };
      circles.push({
        color: getCategoryColor(item.type),
        position: tempPos,
        radius: maxRadius * item.percentage,
        label: item.formatted,
        percentage: item.percentageIntern,
      });
      position.y += maxRadius;
      position.y += offset;
    });

    return circles;
  }

  private drawCircles(svg, circles, index) {
    let isLeft = (index % 2 === 1);
    circles.forEach(circle => {
      this.drawCircle(svg, circle, isLeft);
    })
  }

  private drawCircle(svg, circle, isLeft) {
    let arc = d3.arc();
    let startAngle = Math.PI * 2;
    let endAngle = Math.PI;
    let textoffset = -this.maxRadius;

    if (isLeft) {
      startAngle = -Math.PI * 2;
      endAngle = -Math.PI;
      textoffset = this.maxRadius;
    }

    svg.append('path')
      .attr('transform', 'translate(' + [ circle.position.x, circle.position.y ] + ')')
      .attr('opacity', 0.3)
      .attr('fill', '#E7E7E7')
      .attr('d', arc({
        innerRadius: 0,
        outerRadius: this.maxRadius,
        startAngle: startAngle,
        endAngle: endAngle
      }));

    svg.append('path')
      .attr('transform', 'translate(' + [ circle.position.x, circle.position.y ] + ')')
      .attr('opacity', 1)
      .attr('fill', circle.color)
      .attr('d', arc({
        innerRadius: 0,
        outerRadius: circle.radius,
        startAngle: startAngle,
        endAngle: endAngle
      }));

    svg.append('text')
      .attr('x',  circle.position.x + textoffset)
      .attr('y',  circle.position.y - 2)
      .attr('class', 'compareChart__value')
      .attr('text-anchor', 'middle')
      .text(circle.label);

    svg.append('text')
      .attr('x',  circle.position.x + textoffset)
      .attr('y',  circle.position.y + 14)
      .attr('class', 'compareChart__label')
      .attr('text-anchor', 'middle')
      .text(circle.percentage);
  }
}
