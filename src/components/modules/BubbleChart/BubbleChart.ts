/* tslint:disable */
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import * as d3 from 'd3';
import {MutationTypes} from '../../../store/mutation-types';

@Component({
  template: require('./BubbleChart.html'),
})
export class BubbleChart extends Vue {

  @Prop()
  valueData: any[];

  @Watch('valueData')
  onPropertyChanged(val: any, oldVal: any) {
    let myBubbleChart = this.bubbleChart();

    myBubbleChart('#bubbles', this.valueData);
    this.setupButtons(myBubbleChart);
  }

  public bubbleChart() {
    let that = this;
    let width = 1200;
    let height = 600;

    let center = {
      x: width / 2,
      y: height / 2
    };

    let yearCenters = {
      2016: {
        x: width / 3,
        y: height / 2
      },
      2017: {
        x: width / 2,
        y: height / 2
      },
      2018: {
        x: 2 * width / 3,
        y: height / 2
      }
    };

    let factorBubbles = width / 13 / 1.05;
    let monthCenters = {
      0: {
        x: width / 13 + factorBubbles,
        y: height / 2
      },
      1: {
        x: 2 * width / 13 + (factorBubbles / 2),
        y: height / 2
      },
      2: {
        x: 3 * width / 13 + (factorBubbles / 3),
        y: height / 2
      },
      3: {
        x: 4 * width / 13 + (factorBubbles / 4),
        y: height / 2
      },
      4: {
        x: 5 * width / 13 + (factorBubbles / 5),
        y: height / 2
      },
      5: {
        x: 6 * width / 13 + (factorBubbles / 6),
        y: height / 2
      },
      6: {
        x: 7 * width / 13 - (factorBubbles / 6),
        y: height / 2
      },
      7: {
        x: 8 * width / 13 - (factorBubbles / 5),
        y: height / 2
      },
      8: {
        x: 9 * width / 13 - (factorBubbles / 4),
        y: height / 2
      },
      9: {
        x: 10 * width / 13 - (factorBubbles / 3),
        y: height / 2
      },
      10: {
        x: 11 * width / 13 - (factorBubbles / 2),
        y: height / 2
      },
      11: {
        x: 12 * width / 13 - factorBubbles,
        y: height / 2
      }
    };

    let yearTitleX = {
      2016: 260,
      2017: width / 2,
      2018: width - 260
    };

    /*let factor = width / 13 / 2;
    let monthTitleX = {
      0: width / 13 - factor,
      1: 2 * width / 13 - (factor / 2),
      2: 3 * width / 13 - (factor / 3),
      3: 4 * width / 13 - (factor / 4),
      4: 5 * width / 13 - (factor / 5),
      5: 6 * width / 13 - (factor / 6),
      6: 7 * width / 13 + (factor / 6),
      7: 8 * width / 13 + (factor / 5),
      8: 9 * width / 13 + (factor / 4),
      9: 10 * width / 13 + (factor / 3),
      10: 11 * width / 13 + (factor / 2),
      11: 12 * width / 13 + factor
    };*/

    let forceStrength = 0.05;

    let svg = null;
    let bubbles = null;
    let nodes = [];

    let clusterAreas: any = {};

    function charge(d) {
      return -Math.pow(d.radius, 2) * forceStrength;
    }

    let simulation = d3.forceSimulation()
      .velocityDecay(0.2)
      .force('x', d3.forceX().strength(forceStrength).x(center.x))
      .force('y', d3.forceY().strength(forceStrength).y(center.y))
      .force('charge', d3.forceManyBody().strength(charge))
      .on('tick', ticked);

    simulation.stop();

    let fillColor = d3.scaleOrdinal()
      .domain(['0', '1', '2', '3'])
      .range(['#1280B2', '#B2AB09', '#00AFFF', '#FF1939']);

    let strokeColor = d3.scaleOrdinal()
      .domain(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'])
      .range(['red', 'blue', 'orange', 'black', 'green', 'yellow', 'brown', '#D90866', '#F0A7C2', '#8EAFB4', '#380303', '#030537']);

    let monthsNames = d3.scaleOrdinal()
      .domain(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'])
      .range(['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']);

    function createNodes(rawData) {
      let maxAmount = d3.max(rawData, function(d, i) {
        return +rawData[i].base_data.distance;
      });

      let radiusScale = d3.scalePow()
        .exponent(0.5)
        .range([2, 85])
        .domain([0, maxAmount]);

      let myNodes = rawData.map(function (d) {
        return {
          id: d.id,
          radius: radiusScale(+d.base_data.distance / 20),
          value: d.base_data.distance,
          name: d.name,
          group: d.categorization.activity_type,
          year: new Date(d.date).getFullYear(),
          month: new Date(d.date).getMonth(),
          clusterAnchorMonth: d.categorization.cluster_anchor_month,
          clusterAnchorYear: d.categorization.cluster_anchor_year,
          date: d.date,
          x: Math.random() * 900,
          y: Math.random() * 800
        }
      });

      myNodes.sort(function(a, b) {
        return b.value - a.value;
      });

      return myNodes;
    }

    let chart = function chart(selector, rawData) {
      nodes = createNodes(rawData);

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
          return 'black';
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

      splitBubbles();
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

    function nodeYearPos(d) {
      return yearCenters[d.year].x;
    }

    function nodeMonthPos(d) {
      return monthCenters[d.month].x;
    }

    function groupBubbles() {
      hideYearTitles();
      // hideMonthTitles();

      simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
      simulation.alpha(1).restart();
    }

    function splitBubbles() {
      // hideMonthTitles();
      showYearTitles();

      simulation.force('x', d3.forceX().strength(forceStrength).x(nodeYearPos));
      simulation.alpha(1).restart();
    }

    function splitBubblesMonth() {
      hideYearTitles();
      // howMonthTitles();
      for (let i = 0; i < that.valueData.length; i++) {
        console.log()
        if(that.valueData[i].categorization.cluster_anchor_month in clusterAreas) {

        } else {
          clusterAreas[that.valueData[i].categorization.cluster_anchor_month] = {
            x: null,
            y: null
          }
        }
      }

      let length = Object.keys(clusterAreas).length;

      let i = 1;
      for (let key in clusterAreas) {
        clusterAreas[key].x = (width / length) * i;
        clusterAreas[key].y = height / 2;
        i++;
      }

      function nodePos(d) {
        return clusterAreas[d.clusterAnchorMonth].x;
      }

      simulation.force('x', d3.forceX().strength(forceStrength).x(nodePos));
      simulation.alpha(1).restart();
    }

    function hideYearTitles() {
      svg.selectAll('.year').remove();
    }

    /*function hideMonthTitles() {
      svg.selectAll('.month').remove();
    }*/

    function showYearTitles() {
      let yearsData = d3.keys(yearTitleX);
      let years = svg.selectAll('.year')
        .data(yearsData);

      years.enter().append('text')
        .attr('class', 'year')
        .attr('x', function (d) {
          return yearTitleX[d];
        })
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text(function (d) {
          return d;
        });
    }

    /*function showMonthTitles() {
      let monthData = d3.keys(monthTitleX);
      let years = svg.selectAll('.month')
        .data(monthData);

      years.enter().append('text')
        .attr('class', 'month')
        .attr('x', function (d) {
          return monthTitleX[d];
        })
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text(function (d) {
          return monthsNames(d);
        });
    }*/

    function handleClick(id) {
      that.$store.dispatch(MutationTypes.SET_SELECTED_ACTIVITY, id);
      that.$router.push({
        path: '/activity/' + id
      });
    }

    chart.toggleDisplay = function (displayName) {
      if (displayName === 'year') {
        splitBubbles();
      } else if (displayName === 'month') {
        splitBubblesMonth();
      } else {
        groupBubbles();
      }
    };

    return chart;
  }

  public setupButtons(chartObject) {
    d3.select('#toolbar')
      .selectAll('.button')
      .on('click', function () {
        d3.selectAll('.button').classed('active', false);

        let button = d3.select(this);

        button.classed('active', true);

        let buttonId = button.attr('id');

        chartObject.toggleDisplay(buttonId);
      });
  }

  mounted() {
    if(this.valueData.length !== 0) {
      let myBubbleChart = this.bubbleChart();
      myBubbleChart('#bubbles', this.valueData);
      this.setupButtons(myBubbleChart);
    }
  }
}
