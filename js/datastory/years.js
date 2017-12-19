var propertiesYears = {
  'firstYear': 2001,
  'lastYear': 2018,
};
var constants = {
  killedRadius: function (d) {
    return 3 + 4 * d.killed;
  },
  componentHeight: 300,
  accidentColor: "#c0392b",
  deathColor: "#2c3e50",
  buriedColor: "#1abc9c",
  caughtColor: "#f39c12",
  aspects: ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'],
};


function hydrologicalYear(datum) {
  var date = datum.Date;
  var month = parseInt(date.slice(3,5));
  var year = parseInt(date.slice(6,10));
  return month >= 9 ? year + 1 : year
}

function createYears(accidentsData) {
  var parent = document.getElementById("plot");
  containerWidth = parent.clientWidth;
  containerHeight = 300;

  propertiesYears.years = _.range(propertiesYears.firstYear, propertiesYears.lastYear + 1)

  var margin = {top: 20, right: 20, bottom: 50, left: 30},
    width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.top - margin.bottom;
  
  propertiesYears.margin = margin

  var temp =  d3.select("#plot").append("svg");
  var svg = temp
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")")
  
  g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  x.domain([propertiesYears.firstYear, propertiesYears.lastYear]);

  // x axis label
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("class", "histogram-label")
    .attr("transform", "translate("+ (width/2) +","+(height + 35)+")")
    .text("hydrological year");
  
  
  // Add the X Axis
  svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")));

  // var maxY = d3.max(aggregationPerYear, function(d) {
  //   return d3.max([d.killed, d.caught, d.buried, d.accidents]); })
  y.domain([0, 55]);

  // Add the Y Axis
  svg.append("g")
    .call(d3.axisLeft(y));

  propertiesYears.x = x;
  propertiesYears.svg = svg;
  propertiesYears.width = width;
  propertiesYears.height = height;
  propertiesYears.y = y;
}

function updateYears(accidentsData) {
  var height = propertiesYears.height;
  var width = propertiesYears.width;
  var svg = propertiesYears.svg;
  var x = propertiesYears.x;
  var y = propertiesYears.y;

  var aggregationPerYear = _(accidentsData).groupBy(hydrologicalYear).map(function (objs, key) {
    return {
      'year': +key,
      'killed': _.sumBy(objs, 'killed') | 0,
      'caught': _.sumBy(objs, 'caught') | 0,
      'buried': _.sumBy(objs, 'buried') | 0,
      'accidents': objs.length,
    };
  }).value();

  // TODO add zeros for default

  var lineKilled = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.killed); });
  
  var lineBuried = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.buried); });

  var lineAccidents = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.accidents); });
    
  var lineCaught = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.caught); });
  
  svg.selectAll(".dataLine").remove()

  var enterKilled = svg.selectAll(".killedLine").data([aggregationPerYear])
  
  enterKilled.enter().append("path")
      .attr("class", "dataLine killedLine")
      .attr('fill', 'none')
      .attr('stroke', constants.deathColor)
    .merge(enterKilled)
      .attr("d", lineKilled);

  enterKilled.exit().remove()
  
  var enterBuried = svg.selectAll(".buriedLine").data([aggregationPerYear])
  enterBuried.enter().append("path")
    .attr("class", "dataLine buriedLine")
    .attr('fill', 'none')
    .attr('stroke', constants.buriedColor)
  .merge(enterBuried)
    .attr("d", lineBuried);
  
  enterBuried.exit().remove()

  var enterAccident = svg.selectAll(".accidentLine").data([aggregationPerYear])
  enterAccident.enter().append("path")
    .attr("class", "dataLine accidentLine")
    .attr('fill', 'none')
    .attr('stroke', constants.accidentColor)
  .merge(enterAccident)
    .attr("d", lineAccidents);
    
    enterAccident.exit().remove()

  var enterCaught = svg.selectAll(".caughtLine").data([aggregationPerYear])
  enterCaught.enter().append("path")
    .attr("class", "dataLine caughtLine")
    .attr('fill', 'none')
    .attr('stroke', constants.caughtColor)
  .merge(enterCaught)
    .attr("d", lineCaught);
  
    enterCaught.exit().remove()
}

$.getJSON('/data/accidents/accidents.json', function (data) {
    accidentsData = object2array(data);
    for (var i = 0; i < accidentsData.length; i++) {
        accidentsData[i].id = accidentDatumId(accidentsData[i]);
    }

    createYears(data);
    updateYears(data);
});

// add legend, durty because markdown SVG inline not compatible
document.getElementById('legend-plot').innerHTML = '<svg height="12" width="12" class="keyPoint"><circle r=5 fill="#c0392b" transform="translate(6,6)"/></svg>accidents<br/><svg height="12" width="12" class="keyPoint"><circle r=5 fill="#2c3e50" transform="translate(6,6)"/></svg>deaths<br/><svg height="12" width="12" class="keyPoint"><circle r=5 fill="#ff9900" transform="translate(6,6)"/></svg>caught<br/><svg height="12" width="12" class="keyPoint"><circle r=5 fill="#1abc9c" transform="translate(6,6)"/></svg>burried'

document.getElementById('dot-danger-1').innerHTML = '<svg height="12" width="12"><circle r=5 fill="#ccff66" transform="translate(6,6)"/></svg>'
document.getElementById('dot-danger-4').innerHTML = '<svg height="12" width="12"><circle r=5 fill="#ff0000" transform="translate(6,6)"/></svg>'
document.getElementById('dot-danger-5').innerHTML = '<svg height="12" width="12"><circle r=5 fill="#9102ff" transform="translate(6,6)"/></svg>'
