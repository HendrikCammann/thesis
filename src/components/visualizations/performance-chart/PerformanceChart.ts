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
import {ClusterTypes} from '../../../models/State/StateModel';

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
    if (this.$route.fullPath.indexOf('competition') > -1) {
      this.barMargin = 100;
    }
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
          color: ZoneColors.Pace,
          item: item.item,
          opacity: 0.2,
          position: {
            x: position.x,
            y: position.y,
          }
        },
        heartrate: {
          height: this.barHeight,
          width: width * item.hrBar,
          color: ZoneColors.Heartrate,
          item: item.item,
          opacity: 0.2,
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
    bars.forEach((item, i) => {
      this.drawBar(svg, item.paceMax, true, true);
      this.drawBar(svg, item.heartrateMax, true, true);
      this.drawBar(svg, item.pace, false, false);
      this.drawBar(svg, item.heartrate, false, true);

      if (this.$route.fullPath.indexOf('competition') > -1) {
        let isFaster = false;
        let change = null;
        let text = null;
        let fill = '#7ED321';
        if (bars[i + 1]) {
          isFaster = bars[i].pace.item.base_data.duration < bars[i + 1].pace.item.base_data.duration;
          change = formatSecondsToDuration(Math.abs(bars[i].pace.item.base_data.duration - bars[i + 1].pace.item.base_data.duration), FormatDurationType.Dynamic).all;
        }
        let gradient = 'url(#win-gradient' + i + item.pace.item.name.replace(/\s/g, '') + ')';
        if (!isFaster) {
          gradient = 'url(#lose-gradient' + i + item.pace.item.name.replace(/\s/g, '') + ')';
          text = change + ' langsamer';
          fill = '#D0021B';
        } else {
          text = change + ' schneller';
        }

        let rotate = 0;

        if (i < bars.length - 1) {
          let linearGradient = svg.append('linearGradient')
            .attr('id', 'win-gradient' + i + item.pace.item.name.replace(/\s/g, ''))
            .attr('gradientTransform', 'rotate(90)');

          linearGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-opacity', 0.4)
            .attr('stop-color', '#7ED321');

          linearGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-opacity', 0.1)
            .attr('stop-color', '#7ED321');

          let linearGradient2 = svg.append('linearGradient')
            .attr('id', 'lose-gradient' + i + item.pace.item.name.replace(/\s/g, ''))
            .attr('gradientTransform', 'rotate(90)');

          linearGradient2.append('stop')
            .attr('offset', '0%')
            .attr('stop-opacity', 0.4)
            .attr('stop-color', '#D0021B');

          linearGradient2.append('stop')
            .attr('offset', '100%')
            .attr('stop-opacity', 0.1)
            .attr('stop-color', '#D0021B');

          let trianglePos = item.heartrateMax.position.y + item.heartrateMax.height + 12;
          let triangle = d3.symbol()
            .type(d3.symbolTriangle)
            .size(80);

          svg.append('path')
            .attr('d', triangle)
            .attr('stroke', '')
            .attr('fill', '#7ED321')
            .attr('opacity', 0.5)
            .attr('transform', 'translate(' + 19 + ',' + trianglePos + ') rotate(' + rotate + ')');

          svg.append('rect')
            .attr('x', 16)
            .attr('y', item.heartrateMax.position.y + item.heartrateMax.height + 16)
            .attr('width', 6)
            .attr('height', this.barMargin - 36)
            .attr('fill', gradient)

          svg.append('text')
            .attr('transform', 'translate(' + (40) + ',' + (item.heartrateMax.position.y + item.heartrateMax.height + 36) + ')')
            .attr('class', 'performanceChart__label ')
            .attr('dy', '1em')
            .attr('fill', fill)
            .style('text-anchor', 'right')
            .text(text);
        }
      }
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
      if (bar.color === ZoneColors.Heartrate) {
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
        .attr('transform', 'translate(' + (bar.position.x + (this.barHeight / 2) + 8) + ',' + (bar.position.y - 18) + ')')
        .attr('class', className)
        .attr('dy', '1em')
        .style('text-anchor', 'right')
        .text(formatDate(bar.item.date, FormatDate.Day) + ' | ' +  bar.item.name);
    }
  }
}
