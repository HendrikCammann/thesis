/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {LoadingStatus, loadingStatus} from '../../../models/App/AppStatus';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';

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

  @Watch('data.All')
  @Watch('loadingStatus.activities')
  @Watch('selectedClusters')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded) {
      this.historyChart('#' + this.root, this.data, this.selectedClusters)
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

    data.map(cluster => {
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
      console.log(longest);
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
    }

  }

  private drawSession(svg, bar, factor, pos): void {
    svg.append('rect')
      .attr('x', pos.x)
      .attr('y', pos.y)
      .attr('width', bar.base_data.distance * factor)
      .attr('height', 30)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('fill', getCategoryColor(bar.categorization.activity_type))
      .attr('opacity', 1)
      .on('click', function() {
        console.log(bar.date);
      });
  }

  private drawAbsoluteSessions(svg, bars, visualVariables): void {
    let pos = {
      x: 0,
      y: visualVariables.barHeight,
    };

    for (let i = 0; i < bars.length; i++) {
      // going into first training preparation
      bars[i].reverse().map(item => {
        // going into weeks
        item.map(activityType => {
          activityType.bars.reverse().map(bar => {
            this.drawSession(svg, bar, visualVariables.pxPerDistance, pos);
            pos.x += ((bar.base_data.distance * visualVariables.pxPerDistance) + visualVariables.barMargin);
          });
        });
        pos.x += (visualVariables.clusterMargin - visualVariables.barMargin);
      });
      pos.x = 0;
      pos.y += visualVariables.barHeight * 2;
    }
  }

  private drawCompareSessions(svg, maxWeeks, bars, visualVariables): void {
    let pos = {
      x: 0,
      y: visualVariables.barHeight,
    };

    for (let i = 0; i < maxWeeks; i++) {
      let xPosMax = pos.x;
      let xPosSave = xPosMax;
      pos.y = visualVariables.barHeight;

      for (let j = 0; j < bars.length; j++) {
        if (bars[j].reverse()[i] !== undefined) {
          bars[j][i].map(item => {
            item.bars.reverse().map(bar => {
              this.drawSession(svg, bar, visualVariables.pxPerDistance, pos);
              pos.x += ((bar.base_data.distance * visualVariables.pxPerDistance) + visualVariables.barMargin);
            });
          });
          pos.x += (visualVariables.clusterMargin - visualVariables.barMargin);
          xPosMax = this.getLargestValue(pos.x, xPosMax);
        }
        pos.y += visualVariables.barHeight * 2;
        pos.x = xPosSave;
      }
      pos.x = xPosMax;
    }
  }

  private historyChart(root, data, selectedClusters) {
    let temp = this.extractBarsFromDataset(this.mapSelectedClustersToData(data, selectedClusters));
    let absolute = false;
    let visualVariables = this.calculateVisualVariables(temp.maxWeeks, temp.maxSessions, temp.maxDistance, temp.longest, absolute);

    d3.select(root + " > svg").remove();
    let svg = d3.select(root)
      .append('svg')
      .attr('width', visualVariables.width)
      .attr('height', visualVariables.height);

    if (absolute) {
      this.drawAbsoluteSessions(svg, temp.bars, visualVariables);
    } else {
      this.drawCompareSessions(svg, temp.maxWeeks, temp.bars, visualVariables);
    }
  }

  mounted() {
    //console.log(this.historyChart(this.data, this.selectedClusters));
  }
}
