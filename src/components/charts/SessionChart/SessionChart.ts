import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {loadingStatus, LoadingStatus} from '../../../models/App/AppStatus';
import {PositionModel} from '../../../models/Chart/ChartModels';
import {setupSvg} from '../../../utils/svgInit/svgInit';
import {getCategoryColor} from '../../../utils/calculateVisualVariables';
import {getKeys} from '../../../utils/array-helper';

@Component({
  template: require('./sessionChart.html'),
})
export class SessionChart extends Vue {
  @Prop()
  root: string;

  @Prop()
  data: any;

  @Prop()
  selectedCluster: string;

  @Prop()
  loadingStatus: LoadingStatus;

  @Watch('data')
  @Watch('loadingStatus.activities')
  @Watch('selectedCluster')
  onPropertyChanged(val: any, oldVal: any) {
    if (this.loadingStatus.activities === loadingStatus.Loaded && this.data !== null) {
      console.log('data', this.data);
      this.sessionChart('#' + this.root, this.data);
    }
  }

  /**
   *
   * @param {number} width
   * @param {number} maxClusterMargin
   * @param {number} activityMargin
   * @param {number} totalActivities
   * @param {number} totalDistance
   * @param {number} totalClusters
   * @param {number} canvasMargin
   * @returns {{displayedWidth: number; clusterMargin: number; pxPerMeter: number; activityMargin: number}}
   */
  private calculateVisualVariables(width: number, maxClusterMargin: number, activityMargin: number, totalActivities: number, totalDistance: number, totalClusters: number, canvasMargin: number, barHeight: number) {
    let clusterMargin = maxClusterMargin / totalClusters;

    let spaceNeededForClusterSpacing = (totalClusters - 1) * clusterMargin;
    let spaceNeededForActivitySpacing = (totalActivities - totalClusters) * activityMargin;
    let totalCanvasMargin = canvasMargin * 2;

    let displayedWidth =  width - (spaceNeededForActivitySpacing + spaceNeededForClusterSpacing + totalCanvasMargin);
    let pxPerMeter = displayedWidth / totalDistance;

    return {
      displayedWidth: displayedWidth,
      clusterMargin: clusterMargin,
      pxPerMeter: pxPerMeter,
      activityMargin: activityMargin,
      height: barHeight,
    };
  }

  /**
   *
   * @param data
   * @returns {any}
   */
  private getTotalValuesFromCluster(data): any {
    let sum = 0;
    let activities = 0;
    for (let key in data) {
      activities += data[key].stats.count;
      sum += data[key].stats.distance;
    }
    return {
      distance: sum,
      activities: activities,
    };
  }

  /**
   *
   * @param svg
   * @param height
   * @param width
   * @param color
   * @param {PositionModel} position
   * @param id
   */
  private drawActivity(svg, height, width, color, position: PositionModel, id) {
    svg.append('rect')
      .attr('x', position.x)
      .attr('y', position.y)
      .attr('height', height)
      .attr('width', width)
      .attr('fill', color)
      .attr('opacity', 0.7)
      .on('click', () => {
        console.log(id);
      });
  }

  /**
   *
   * @param svg
   * @param visualVariables
   * @param {PositionModel} position
   * @param data
   */
  private drawChart(svg, visualVariables, position: PositionModel, data) {
    let pos = position;
    let keys = getKeys(data);
    keys.reverse();

    for (let key in keys) {
      let drawnActivities = 0;
      for (let runType in data[keys[key]].stats.typeCount) {
        let correctlyOrderedActivities = data[keys[key]].stats.typeCount[runType].activities;
        for (let i = (correctlyOrderedActivities.length - 1); i >= 0; i--) {
          let activity = this.$store.getters.getActivity(correctlyOrderedActivities[i]);
          let width = activity.base_data.distance * visualVariables.pxPerMeter;
          this.drawActivity(svg, visualVariables.height, width, getCategoryColor(activity.categorization.activity_type), pos, activity.date);
          drawnActivities++;
          pos.x += width;
          if (drawnActivities < data[keys[key]].activities.length) {
            pos.x += visualVariables.activityMargin;
          }
        }
      }
      pos.x += visualVariables.clusterMargin;
    }
  }


  /**
   *
   * @param {string} root
   * @param data
   */
  private sessionChart(root: string, data) {
    let width = 1140;
    let height = 30;
    let clusterMaxMargin = 250;
    let activityMargin = 2;
    let barHeight = 10;
    let margin = 10;

    let totalClusters = Object.keys(data).length;
    let totalClusterValues = this.getTotalValuesFromCluster(data);
    let visualVariables = this.calculateVisualVariables(width, clusterMaxMargin, activityMargin, totalClusterValues.activities, totalClusterValues.distance, totalClusters, margin, barHeight);
    let svg = setupSvg(root, width, height);

    let position: PositionModel = {
      x: margin,
      y: height - barHeight,
    };

    this.drawChart(svg, visualVariables, position, data);
  }
}
