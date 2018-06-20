/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {setupSvg} from '../../../utils/svgInit/svgInit';
import {formatPace} from '../../../utils/format-data';
import {FormatDate, FormatDurationType, FormatPaceType} from '../../../models/FormatModel';
import {getLargerValue} from '../../../utils/numbers/numbers';
import {CategoryColors, ZoneColors} from '../../../models/VisualVariableModel';
import {PositionModel} from '../../../models/Chart/ChartModels';
import {formatDate, formatSecondsToDuration} from '../../../utils/time/time-formatter';
import {loadingStatus} from '../../../models/App/AppStatus';
import {eventBus} from '../../../main';
import {modalEvents} from '../../../events/Modal/modal';

@Component({
  template: require('./performanceChart.html'),
})
export class PerformanceChart extends Vue {
  @Prop()
  data: any[];

  @Prop()
  width: number;

  @Prop()
  usePace: boolean;

  public offsetTop = 40;
  public offsetBottom = 16;
  public barHeight = 40;
  public barMargin = 40;
  public barOffset = 4;

  @Watch('width')
  @Watch('data')
  onPropertyChanged(val: any, oldVal: any) {
    this.performanceChart(this.data, this.width)
  }

  mounted() {
    this.performanceChart(this.data, this.width)
  }

  private performanceChart(data, width) {
    let height = this.calculateHeight(data);
    let svg = setupSvg('#performance' , width, height);
    let bars = this.calculateBars(data, width);
    this.drawBars(svg, bars);
  }

  private calculateHeight(data) {
    return this.offsetTop + this.offsetBottom + (data.length * this.barOffset) + ((data.length * 2) * this.barHeight) + ((data.length - 1) * this.barMargin);
  }

  private calculateBars(data, width) {
    let bars = [];
    let position: PositionModel = {
      x: -(this.barHeight / 2),
      y: this.offsetTop,
    };

    data.forEach(item => {
      let bar = {
        pace: {
          height: this.barHeight,
          width: width * item.paceBar,
          color: '#D9E4EB',
          item: item.item,
          opacity: 1,
          position: {
            x: position.x,
            y: position.y,
          }
        },
        heartrate: {
          height: this.barHeight,
          width: width * item.hrBar,
          color: '#F7E7E8',
          item: item.item,
          opacity: 1,
          position: {
            x: position.x,
            y: position.y + this.barHeight + this.barOffset,
          }
        },
        paceMax: {
          height: this.barHeight,
          width: width,
          color: '#E7E7E7',
          item: item.item,
          opacity: 0.3,
          position: {
            x: position.x,
            y: position.y,
          }
        },
        heartrateMax: {
          height: this.barHeight,
          width: width,
          color: '#E7E7E7',
          item: item.item,
          opacity: 0.3,
          position: {
            x: position.x,
            y: position.y + this.barHeight + this.barOffset,
          }
        }
      };
      bars.push(bar);
      position.y += (this.barHeight + this.barOffset + this.barHeight + this.barMargin);
    });

    return bars;
  }

  private drawBars(svg, bars) {
    bars.forEach(item => {
      this.drawBar(svg, item.paceMax, true, true);
      this.drawBar(svg, item.heartrateMax, true, true);
      this.drawBar(svg, item.pace, false, false);
      this.drawBar(svg, item.heartrate, false, true);
    });
  }

  private drawBar(svg, bar, hideName, hideDate) {
    svg.append('rect')
      .attr('x', bar.position.x)
      .attr('y', bar.position.y)
      .attr('rx', this.barHeight / 2)
      .attr('ry', this.barHeight / 2)
      .attr('height', bar.height)
      .attr('width', bar.width)
      .attr('fill', bar.color)
      .attr('opacity', bar.opacity)
      .on('click', () => {
        eventBus.$emit(modalEvents.open_Modal, bar.item);
      });

    if(!hideName) {
      let className = 'performanceChart__label--pace';
      let text = formatSecondsToDuration(bar.item.base_data.duration, FormatDurationType.Dynamic).all;
      if (this.usePace) {
        text = formatPace(bar.item.average_data.speed, FormatPaceType.MinPerKm).formattedVal + '/km'
      }
      let opacity = 1;
      if (bar.color === '#F7E7E8') {
        className = 'performanceChart__label--hr';
        if (bar.item.average_data.heartrate) {
          text = bar.item.average_data.heartrate + 'bpm'
        } else {
          text = 'Keine Herzfrequenz aufgezeichnet';
          opacity = 0.2;
        }
      }
      svg.append('text')
        .attr('transform', 'translate(' + (bar.position.x + (this.barHeight / 2) + 8) + ',' + (bar.position.y + 10) + ')')
        .attr('class', 'performanceChart__label ' + className)
        .attr('dy', '1em')
        .attr('opacity', opacity)
        .style('text-anchor', 'right')
        .text(text);
    }

    if(!hideDate) {
      let className = 'performanceChart__date';

      svg.append('text')
        .attr('transform', 'translate(' + (bar.position.x + (this.barHeight / 2) + 8) + ',' + (bar.position.y - 16) + ')')
        .attr('class', className)
        .attr('dy', '1em')
        .style('text-anchor', 'right')
        .text(formatDate(bar.item.date, FormatDate.Day) + ' | ' +  bar.item.name);
    }
  }
}
