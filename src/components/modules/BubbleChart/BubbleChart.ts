/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {MutationTypes} from '../../../store/mutation-types';
import {ClusterType, RunType} from '../../../store/state';
import {FilterModel} from '../../../models/Filter/FilterModel';

@Component({
  template: require('./BubbleChart.html'),
})
export class BubbleChart extends Vue {

  @Prop()
  data: Object;

  @Prop()
  filter: FilterModel;

  @Watch('data.byMonths')
  @Watch('filter.selectedRunType')
  @Watch('filter.selectedCluster')
  onPropertyChanged(val: any, oldVal: any) {
    this.drawDiagram('#bubbles', this.data, this.filter);
  }

  /**
   * positions the years titles
   * @param {number} index
   * @returns {number}
   */
  public calcYTitlePos(index: number): number {
    if (index < 10) {
      return 40;
    } else if (index < 20){
      return 240;
    } else {
      return 440;
    }
  }

  /**
   *
   * @param {number} height
   * @param {number} index
   * @param {number} length
   * @returns {number}
   */
  public calcYCenterPos(height: number, index: number, length: number): number {
    if (length < 10) {
      return height / 2;
    }
    if (index < 10) {
      return 120;
    } else if (index < 20 && index >= 10){
      return 320;
    } else {
      return 520;
    }
  }

  /**
   *
   * @param {number} width
   * @param {number} index
   * @param {number} length
   * @returns {number}
   */
  public calcXPos(width: number, index: number, length: number) {
    let maxLength;
    if (length > 10) {
      maxLength = 10;
    } else {
      maxLength = length;
    }
    return (width / (maxLength + 1)) * ((index % maxLength) + 1)
  }

  public bubbleChart(titles) {
    let that = this;
    let width = 1200;
    let height = 600;
    let padding = 1.5;

    let center = {
      x: width / 2,
      y: height / 2
    };

    let clusterPositions = {};
    let clusterTitlePositions = {};

    for (let i = 0; i < titles.length; i++) {
      clusterTitlePositions[titles[i]] = {
        x: that.calcXPos(width, i, titles.length),
        y: that.calcYTitlePos(i),
      };
      clusterPositions[titles[i]] = {
        x: that.calcXPos(width, i, titles.length),
        y: that.calcYCenterPos(height, i, titles.length)
      };
    }

    let forceStrength = 0.05;

    let svg = null;
    let bubbles = null;
    let nodes = [];

    function charge(d) {
      return -Math.pow(d.radius, 2) * forceStrength;
    }

    let simulation = d3.forceSimulation()
      .velocityDecay(0.2)
      .force('x', d3.forceX().strength(forceStrength).x(center.x))
      .force('y', d3.forceY().strength(forceStrength).y(center.y))
      .force('collide', d3.forceCollide(function (d: any) {
        return d.radius + padding;
      }))
      .force('charge', d3.forceManyBody().strength(charge))
      .on('tick', ticked);

    simulation.stop();

    let fillColor = d3.scaleOrdinal()
      .domain([RunType.Run, RunType.Competition, RunType.LongRun, RunType.ShortIntervals, RunType.Uncategorized])
      .range(['#1280B2', '#B2AB09', '#00AFFF', '#FF1939', 'violet']);

    function createNodes(rawData, cluster) {
      let maxAmount = d3.max(rawData, function(d, i) {
        return +rawData[i].base_data.distance;
      });

      let radiusScale = d3.scalePow()
        .exponent(0.5)
        .range([2, 85])
        .domain([0, maxAmount]);

      function setCluster(cluster, d) {
        switch(cluster) {
          case ClusterType.All:
            return null;
          case ClusterType.ByYears:
            return d.categorization.cluster_anchor_year;
          case ClusterType.ByMonths:
            return d.categorization.cluster_anchor_month;
          case ClusterType.ByWeeks:
            return null;
          default:
            return null;
        }
      }

      function setCircleSizes(cluster) {
        switch(cluster) {
          case ClusterType.All:
            return 60;
          case ClusterType.ByYears:
            return 60;
          case ClusterType.ByMonths:
            return 240;
          case ClusterType.ByWeeks:
            return 240;
          default:
            return 60;
        }
      }

      let myNodes = rawData.map(function (d) {
        return {
          id: d.id,
          radius: radiusScale(+d.base_data.distance / setCircleSizes(cluster)),
          value: d.base_data.distance,
          name: d.name,
          group: d.categorization.activity_type,
          year: new Date(d.date).getFullYear(),
          month: new Date(d.date).getMonth(),
          clusterAnchorMonth: d.categorization.cluster_anchor_month,
          clusterAnchorYear: d.categorization.cluster_anchor_year,
          usedAnchor: setCluster(cluster, d),
          date: d.date,
          // x: Math.random() * 900,
          // y: Math.random() * 800
        }
      });

      myNodes.sort(function(a, b) {
        return b.value - a.value;
      });

      return myNodes;
    }

    let chart = function chart(selector, rawData, cluster) {
      nodes = createNodes(rawData, cluster);

      svg = d3.select(selector)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      bubbles = svg.selectAll('.bubble')
        .data(nodes, function (d) {
          return d.id
        });

      let bubblesE = bubbles.enter().append('circle')
        .classed('bubble', true)
        .attr('r', 0)
        .attr('fill', function (d) {
          return fillColor(d.group);
        })
        .attr('stroke', function (d) {
          return 'none';
        })
        .attr('stroke-width', 2)
        .on('click', function(d) {
          handleClick(d.id);
        });

      bubbles = bubbles.merge(bubblesE);

      bubbles.transition()
        .duration(2000)
        .attr('r', function (d) {
          return d.radius;
        });

      simulation.nodes(nodes);

      switch(that.filter.selectedCluster) {
        case ClusterType.All:
          groupBubbles();
          break;
        case ClusterType.ByYears:
          splitBubbles();
          break;
        case ClusterType.ByMonths:
          splitBubbles();
          break;
      }
    };

    function ticked() {
      bubbles
        .attr('cx', function (d) {
          return d.x;
        })
        .attr('cy', function (d) {
          return d.y;
        });
    }

    function nodePosX(d) {
      return clusterPositions[d.usedAnchor].x;
    }

    function nodePosY(d) {
      return clusterPositions[d.usedAnchor].y;
    }

    function groupBubbles() {
      hideTitles();

      simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
      simulation.force('y', d3.forceY().strength(forceStrength).y(center.y));
      simulation.alpha(1).restart();
    }

    function splitBubbles() {
      showTitles();

      simulation.force('x', d3.forceX().strength(forceStrength).x(nodePosX));
      simulation.force('y', d3.forceY().strength(forceStrength).y(nodePosY));
      simulation.alpha(1).restart();
    }

    function hideTitles() {
      svg.selectAll('.year').remove();
    }

    function showTitles() {
      let yearsData = d3.keys(clusterTitlePositions);
      let years = svg.selectAll('.year')
        .data(yearsData);

      years.enter().append('text')
        .attr('class', 'year')
        .attr('x', function (d) {
          return clusterTitlePositions[d].x;
        })
        .attr('y', function (d) {
          return clusterTitlePositions[d].y;
        })
        .attr('text-anchor', 'middle')
        .text(function (d) {
          return d;
        });
    }

    function handleClick(id) {
      that.$store.dispatch(MutationTypes.SET_SELECTED_ACTIVITY, id);
      that.$router.push({
        path: '/activity/' + id
      });
    }

    return chart;
  }

  public selectClusterData(data, cluster) {
    switch (cluster) {
    case ClusterType.ByYears:
      return data.byYears;
    case ClusterType.ByMonths:
      return data.byMonths;
    case ClusterType.ByWeeks:
      return data.byWeeks;
    case ClusterType.All:
      return data.all;
    }
  }

  public generateTitles(array, title) {
    if (!array.includes(title)) {
      array.push(title);
    }
  }

  public drawDiagram(domRoot, data, filter) {
    d3.select(domRoot + " > svg").remove();
    let copyData = this.selectClusterData(data, filter.selectedCluster);
    let filteredData = [];
    let titles = [];

    for (let bucket in copyData) {
      for(let i = 0; i < copyData[bucket].activities.length; i++) {
        let activity = this.$store.getters.getActivity(copyData[bucket].activities[i]);
        if (filter.selectedRunType === RunType.All) {
          this.generateTitles(titles, copyData[bucket].rangeName);
          filteredData.push(activity);
        } else if (activity.categorization.activity_type === filter.selectedRunType) {
          this.generateTitles(titles, copyData[bucket].rangeName);
          filteredData.push(activity);
        }
      }
    }
    let myBubbleChart = this.bubbleChart(titles);
    myBubbleChart(domRoot, filteredData, filter.selectedCluster);
  }

  mounted() {
  }
}
