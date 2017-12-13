var propertiesYears = {
  'firstYear': 2001,
  'lastYear': 2018,
};

function createYears(accidentsData, addFilter, removeFilter) {
  var parent = document.getElementById("years");
  containerWidth = parent.clientWidth;
  containerHeight = constants.componentHeight;

  propertiesYears.years = _.range(propertiesYears.firstYear, propertiesYears.lastYear + 1)

  var margin = {top: 20, right: 20, bottom: 50, left: 30},
    width = containerWidth - margin.left - margin.right,
    height = containerHeight - margin.top - margin.bottom;
  
  var svg = d3.select("#years").append("svg")
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

function updateYears(accidentsData, addFilter, removeFilter) {
  var height = propertiesYears.height;
  var width = propertiesYears.width;
  var svg = propertiesYears.svg;
  var x = propertiesYears.x;
  var y = propertiesYears.y;

  console.log('height', height, 'width', width)

  function hydrologicalYear(datum) {
    var date = datum.Date;
    var month = parseInt(date.slice(3,5));
    var year = parseInt(date.slice(6,8));
    return 2000 + (month >= 9 ? year + 1 : year)
  }

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
    .x(function(d) { console.log('x', d.year, x(d.year)); return x(d.year); })
    .y(function(d) { console.log('y', d.buried, y(d.buried)); return y(d.buried); });

  var lineAccidents = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.accidents); });
    
  var lineCaught = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.caught); });
    
  svg.append("path")
    .data([aggregationPerYear])
    .attr("class", "line")
    .attr('fill', 'none')
    .attr('stroke', constants.deathColor)
    .attr("d", lineKilled);

  svg.append("path")
      .data([aggregationPerYear])
      .attr("class", "line")
      .style("stroke", constants.buriedColor)
      .attr('fill', 'none')
      .attr("d", lineBuried);
  
  svg.append("path")
      .data([aggregationPerYear])
      .attr("class", "line")
      .style("stroke", constants.accidentColor)
      .attr('fill', 'none')
      .attr("d", lineAccidents);
      
  svg.append("path")
      .data([aggregationPerYear])
      .attr("class", "line")
      .style("stroke", constants.caughtColor)
      .attr('fill', 'none')
      .attr("d", lineCaught);


}