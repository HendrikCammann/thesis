/* tslint:disable */
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';
import * as d3 from 'd3';

let test = require('./gates_money.json');


@Component({
  template: require('./BubbleChart.html'),
})
export class BubbleChart extends Vue {

  public bubbleChart() {
    let width = 940;
    let height = 600;

    let center = {
      x: width / 2,
      y: height / 2
    };

    let yearCenters = {
      2008: {
        x: width / 3,
        y: height / 2
      },
      2009: {
        x: width / 3,
        y: height / 2
      },
      2010: {
        x: 2 * width / 3,
        y: height / 2
      }
    };

    let yearTitleX = {
      2008: 160,
      2009: width / 2,
      2010: width - 160
    };

    let forceStrength = 0.03;

    let svg = null;
    let bubbles = null;
    let nodes = [];

    function charge(d) {
      return -Math.pow(d.radius, 2.0) * forceStrength;
    }

    let simulation = d3.forceSimulation()
      .velocityDecay(0.2)
      .force('x', d3.forceX().strength(forceStrength).x(center.x))
      .force('y', d3.forceY().strength(forceStrength).y(center.y))
      .force('charge', d3.forceManyBody().strength(charge))
      .on('tick', ticked);

    simulation.stop();

    let fillColor = d3.scaleOrdinal()
      .domain(['low', 'medium', 'high'])
      .range(['#d84b2a', '#beccae', '#7aa25c']);

    function createNodes(rawData) {
      let maxAmount = d3.max(rawData, function(d, i) {
        return +rawData[i].total_amount;
      });

      let radiusScale = d3.scalePow()
        .exponent(0.5)
        .range([2, 85])
        .domain([0, maxAmount]);

      let myNodes = rawData.map(function (d) {
        return {
          id: d.id,
          radius: radiusScale(+d.total_amount),
          value: +d.total_amount,
          name: d.grant_title,
          org: d.organization,
          group: d.group,
          year: d.start_year,
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
        .attr('stroke-width', 2);

      bubbles = bubbles.merge(bubblesE);

      bubbles.transition()
        .duration(2000)
        .attr('r', function (d) {
          return d.radius;
        });

      simulation.nodes(nodes);

      groupBubbles();
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

    function groupBubbles() {
      hideYearTitles();

      simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
      simulation.alpha(1).restart();
    }

    function splitBubbles() {
      showYearTitles();

      simulation.force('x', d3.forceX().strength(forceStrength).x(nodeYearPos));
      simulation.alpha(1).restart();
    }

    function hideYearTitles() {
      svg.selectAll('.year').remove();
    }

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

    /*chart.toggleDisplay = function (displayName) {
      if (displayName === 'year') {
        splitBubbles();
      } else {
        groupBubbles();
      }
    };*/

    return chart;
  }

  mounted() {
    let myBubbleChart = this.bubbleChart();

    function setupButtons() {
      d3.select('#toolbar')
        .selectAll('.button')
        .on('click', function () {
          d3.selectAll('.button').classed('active', false);

          let button = d3.select(this);

          button.classed('active', true);

          let buttonId = button.attr('id');

          /*myBubbleChart.toggleDisplay(buttonId);*/
        });
    }

    myBubbleChart('#bubbles', test);

    setupButtons();
  }
}
