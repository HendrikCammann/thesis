/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {LoadingStatus, loadingStatus} from '../../../models/App/AppStatus';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';
import {filterBus} from '../../../main';
import {filterEvents} from '../../../events/filter';

@Component({
  template: require('./historyChart.html'),
})
export class HistoryChart extends Vue {
  @Prop()
  root: string;

  @Prop()
  data: Object;

  @Prop()
  selectedClusters: string[];

  @Prop()
  loadingStatus: LoadingStatus;

  @Prop()
  filterRange: number[];

  @Watch('data.All')
  @Watch('loadingStatus.activities')
  @Watch('selectedClusters')
  @Watch('filterRange')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.historyChart('#' + this.root, this.data, this.selectedClusters, this.filterRange)
    }
  }

  private mapSelectedClustersToData(data, selectedClusters) {
    let temp = [];
    selectedClusters.map(cluster => {
      temp.push(data[cluster]);
    });
    return temp;
  }

  private getLargestValue(value, currentMax): number {
    if (value > currentMax) {
      return value;
    } else {
      return currentMax;
    }
  }

  private extractBarsFromDataset(data) {
    let bars = [];
    let longest = [];
    let maxDistance = 0;
    let maxWeeks = 0;
    let maxSessions = 0;

    data.map((cluster) => {
      let temp = [];
      maxDistance = this.getLargestValue(cluster.stats.distance, maxDistance);
      maxWeeks = this.getLargestValue(Object.keys(cluster.byWeeks).length, maxWeeks);
      maxSessions = this.getLargestValue(cluster.stats.count, maxSessions);

      let i = 0;
      for (let week in cluster.byWeeks) {
        let weekcount = 0;
        let weekBars = [];
        for (let type in cluster.byWeeks[week].stats.typeCount) {
          if (cluster.byWeeks[week].stats.typeCount[type].activities.length > 0) {
            let typeObject = {
              type: cluster.byWeeks[week].stats.typeCount[type],
              bars: []
            };
            cluster.byWeeks[week].stats.typeCount[type].activities.map(activity => {
              let ac = this.$store.getters.getActivity(activity);
              weekcount += ac.base_data.distance;
              typeObject.bars.push(ac)
            });
            weekBars.push(typeObject);
          }
        }
        if (longest[i] === undefined) {
          longest[i]= weekcount;
        } else {
          longest[i] = this.getLargestValue(weekcount, longest[i])
        }
        temp.push(weekBars);
        i++
      }
      bars.push(temp);
    });

    return {
      maxDistance: maxDistance,
      bars: bars,
      maxWeeks: maxWeeks,
      maxSessions: maxSessions,
      longest: longest.reduce((a, b) => a + b, 0),
    };
  }

  private calculateVisualVariables(maxWeeks, maxSessions, maxDistance, longest, isAbsolute) {
    let width = 1140;
    let height = 300;
    let clusterMaxMargin = 250;
    let barMargin = 1;
    let pxPerDistance = 0;
    let barHeight = 30;
    let marginBottom = 90;

    let displayedWidth = width;
    let clusterMargin = 0;

    if (maxWeeks > 1) {
      displayedWidth -= clusterMaxMargin;
      clusterMargin = (clusterMaxMargin / (maxWeeks - 1));
    }

    if (maxSessions > 1) {
      displayedWidth -= (barMargin * (maxSessions - maxWeeks - 1));
    }

    if (isAbsolute) {
      pxPerDistance = displayedWidth / maxDistance;
    } else {
      pxPerDistance = displayedWidth / longest;
    }

    return {
      width: width,
      height: height,
      barMargin: barMargin,
      clusterMargin: clusterMargin,
      pxPerDistance: pxPerDistance,
      barHeight: barHeight,
      marginBottom: marginBottom,
    }

  }

  private drawSession(svg, bar, factor, pos, isFaded): void {
    let opacity = 1;
    if (isFaded) {
      opacity = 0.2;
    }
    svg.append('rect')
      .attr('x', pos.x)
      .attr('y', pos.y)
      .attr('width', bar.base_data.distance * factor)
      .attr('height', 30)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('fill', getCategoryColor(bar.categorization.activity_type))
      .attr('opacity', opacity)
      .on('click', function() {
        console.log(bar.date);
      });
  }

  private drawWeekLabel(svg, pos, barHeight, text): void {
    svg.append('text')
      .attr('x', pos.x)
      .attr('y', pos.y + barHeight + 12)
      .attr('class', 'historyChart__week')
      .attr('text-anchor', 'left')
      .text(text);
  }

  private drawClusterNames(svg, pos, clusters, marginBottom): void {
    clusters.map(item => {
      svg.append('text')
        .attr('x', pos.x)
        .attr('y', pos.y - 8)
        .attr('class', 'historyChart__label')
        .attr('text-anchor', 'left')
        .text(item);

      pos.y += marginBottom;
    });
  }

  private drawAbsoluteSessions(svg, bars, visualVariables, clusters, filterRange): void {
    let pos = {
      x: 0,
      y: visualVariables.barHeight,
    };
    let shownBars = [];

    for (let i = 0; i < bars.length; i++) {
      let tempArr = [];
      // going into first training preparation
      bars[i].reverse().map((item, j) => {
        this.drawWeekLabel(svg, pos, visualVariables.barHeight, 'W' + (j + 1));
        // going into weeks
        item.map(activityType => {
          activityType.bars.reverse().map(bar => {
            let temp = pos.x + (bar.base_data.distance * visualVariables.pxPerDistance);
            let isFaded = (temp > filterRange[1] || temp < filterRange[0]);
            this.drawSession(svg, bar, visualVariables.pxPerDistance, pos, isFaded);
            pos.x += ((bar.base_data.distance * visualVariables.pxPerDistance) + visualVariables.barMargin);
            if (!isFaded) {
              tempArr.push(bar);
            }
          });
        });
        pos.x += (visualVariables.clusterMargin - visualVariables.barMargin);
      });
      pos.x = 0;
      pos.y += visualVariables.marginBottom;
      shownBars.push(tempArr);
    }

    pos = {
      x: 0,
      y: visualVariables.barHeight,
    };

    this.drawClusterNames(svg, pos, clusters, visualVariables.marginBottom);

    console.log(shownBars);
  }

  private drawCompareSessions(svg, maxWeeks, bars, visualVariables, clusters, filterRange): void {
    let pos = {
      x: 0,
      y: visualVariables.barHeight,
    };
    let shownBars = [];

    for (let i = 0; i < maxWeeks; i++) {
      let xPosMax = pos.x;
      let xPosSave = xPosMax;
      pos.y = visualVariables.barHeight;

      for (let j = 0; j < bars.length; j++) {
        if (!shownBars[j]) {
          shownBars[j] = [];
        }
        if (bars[j].reverse()[i] !== undefined) {
          svg.append('text')
            .attr('x', pos.x)
            .attr('y', pos.y + visualVariables.barHeight + 12)
            .attr('class', 'historyChart__week')
            .attr('text-anchor', 'left')
            .text('W' + (i + 1));

          bars[j][i].map(item => {
            item.bars.reverse().map(bar => {
              let temp = pos.x + (bar.base_data.distance * visualVariables.pxPerDistance);
              let isFaded = (temp > filterRange[1] || temp < filterRange[0]);
              this.drawSession(svg, bar, visualVariables.pxPerDistance, pos, isFaded);
              pos.x += ((bar.base_data.distance * visualVariables.pxPerDistance) + visualVariables.barMargin);
              if (!isFaded) {
                shownBars[j].push(bar);
              }
            });
          });
          pos.x += (visualVariables.clusterMargin - visualVariables.barMargin);
          xPosMax = this.getLargestValue(pos.x, xPosMax);
        }
        pos.y += visualVariables.marginBottom;
        pos.x = xPosSave;
      }
      pos.x = xPosMax;
    }

    pos = {
      x: 0,
      y: visualVariables.barHeight,
    };

    filterBus.$emit(filterEvents.set_Compare_Shown_Bars, shownBars);

    this.drawClusterNames(svg, pos, clusters, visualVariables.marginBottom);
  }

  private historyChart(root, data, selectedClusters, filterRange) {
    let temp = this.extractBarsFromDataset(this.mapSelectedClustersToData(data, selectedClusters));
    let absolute = false;
    let visualVariables = this.calculateVisualVariables(temp.maxWeeks, temp.maxSessions, temp.maxDistance, temp.longest, absolute);

    d3.select(root + " > svg").remove();
    let svg = d3.select(root)
      .append('svg')
      .attr('width', visualVariables.width)
      .attr('height', visualVariables.height);

    if (absolute) {
      this.drawAbsoluteSessions(svg, temp.bars, visualVariables, selectedClusters, filterRange);
    } else {
      this.drawCompareSessions(svg, temp.maxWeeks, temp.bars, visualVariables, selectedClusters, filterRange);
    }
  }

  mounted() {
    //console.log(this.historyChart(this.data, this.selectedClusters));
  }
}
